mod tests;

use core::alloc::GlobalAlloc;
use core::cell::UnsafeCell;

extern {
    pub static __heap_start : u32;
    pub static __heap_end : u32;
}

#[allow(non_upper_case_globals)]
#[no_mangle]
pub static __rust_no_alloc_shim_is_unstable: u8 = 0;

#[global_allocator]
static HEAP: PageAllocator = PageAllocator {
    next_page: UnsafeCell::new(0),
    free_16: UnsafeCell::new(0),
    free_256: UnsafeCell::new(0),
    free_4096: UnsafeCell::new(0)
};

struct PageAllocator {
    next_page: UnsafeCell<usize>,
    free_16: UnsafeCell<usize>,
    free_256: UnsafeCell<usize>,
    free_4096: UnsafeCell<usize>
}

// OK to hack this because we are single threaded for now
unsafe impl Sync for PageAllocator {}

unsafe impl GlobalAlloc for PageAllocator {
    unsafe fn alloc(&self, layout: core::alloc::Layout) -> *mut u8 {
        if layout.size() <= 16 && layout.align() <= 16 {
            self.next(&self.free_16)
        } else if layout.size() <= 256 && layout.align() <= 256 {
            self.next(&self.free_256)
        } else if layout.size() <= 4096 && layout.align() <= 4096 {
            self.next(&self.free_4096)
        } else {
            core::ptr::null_mut() // this is allegedly what will cause OOM exceptions
        }
    }

    unsafe fn dealloc(&self, _ptr: *mut u8, _layout: core::alloc::Layout) {
        // we don't support deallocation yet
    }
}

impl PageAllocator {
    unsafe fn next(&self, list: &UnsafeCell<usize>) -> *mut u8 {
        let lp = list.get();
        if *lp == 0 {
            let np = self.next_page.get();
            // we don't have any free memory, allocate next page
            if *np == 0 {
                *np = (&__heap_start as *const _) as usize;
            }
            if *np >= (&__heap_end as *const _) as usize {
                return core::ptr::null_mut(); // we are out of memory
            }

            // TODO: still need to initialize inside of block if not 4096
            *lp = *np;
            *np = *np + 4096;
        }
        let curr = *lp;
        *lp = *(curr as *const usize);
        curr as *mut u8
    }
}