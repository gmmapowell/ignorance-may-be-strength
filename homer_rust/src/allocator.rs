mod tests;
mod init_alloc;

use core::alloc::GlobalAlloc;
use core::cell::UnsafeCell;

struct PageAllocator<F> where F: Fn() -> (usize,usize) {
    next_page: UnsafeCell<usize>,
    end: UnsafeCell<usize>,
    free_16: UnsafeCell<usize>,
    free_256: UnsafeCell<usize>,
    free_4096: UnsafeCell<usize>,
    init: F
}

// OK to hack this because we are single threaded for now
unsafe impl<F> Sync for PageAllocator<F> where F: Fn() -> (usize,usize) {}

unsafe impl<F> GlobalAlloc for PageAllocator<F> where F: Fn() -> (usize,usize) {
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

impl<F> PageAllocator<F> where F: Fn() -> (usize,usize) {
    unsafe fn next(&self, list: &UnsafeCell<usize>) -> *mut u8 {
        let lp: *mut usize = list.get();
        if *lp == 0 {
            let np = self.next_page.get();
            // we don't have any free memory, allocate next page
            if *np == 0 {
                let (start, end) = (self.init)();
                *np = start;
                *self.end.get() = end;
            }
            if *np >= *self.end.get() {
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