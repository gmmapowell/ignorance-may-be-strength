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
            self.next(&self.free_16, 16)
        } else if layout.size() <= 256 && layout.align() <= 256 {
            self.next(&self.free_256, 256)
        } else if layout.size() <= 4096 && layout.align() <= 4096 {
            self.next(&self.free_4096, 4096)
        } else {
            self.multipage(layout.size())
        }
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: core::alloc::Layout) {
        if (ptr as usize) & 0xfff == 0 {
            // 4096 byte block or bigger
            if layout.size() <= 4096 {
                *(ptr as *mut usize) = *self.free_4096.get();
                *self.free_4096.get() = ptr as usize;
            } else {
                let cnt: usize = (layout.size()+4095) & !4095;
                let mut after = ptr.add(cnt);
                while after > ptr {
                    after = after.sub(4096);
                    *(after as *mut usize) = *self.free_4096.get();
                    *self.free_4096.get() = after as usize;
                }
            }
        } else {
            let page = ((ptr as usize) & !0xfff) as *mut usize;
            let size = *page;
            if size == 16 {
                *(ptr as *mut usize) = *self.free_16.get();
                *self.free_16.get() = ptr as usize;
            } else {
                *(ptr as *mut usize) = *self.free_256.get();
                *self.free_256.get() = ptr as usize;
            }
        }
    }
} 

impl<F> PageAllocator<F> where F: Fn() -> (usize,usize) {
    unsafe fn next(&self, list: &UnsafeCell<usize>, size: usize) -> *mut u8 {
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

            self.init_block(*np as *mut u8, list, size);
            *np = *np + 4096;
        }
        let curr = *lp;
        *lp = *(curr as *const usize);
        curr as *mut u8
    }

    fn multipage(&self, size: usize) -> *mut u8 {
        // round size up to next 4096
        let cnt: usize = (size+4095) & !4095;
        unsafe {
            let mut ret = *self.next_page.get() as *mut u8;
            // we don't have any free memory, allocate next page
            if ret == core::ptr::null_mut() {
                let (start, end) = (self.init)();
                *self.next_page.get() = start;
                *self.end.get() = end;
                ret = start as *mut u8;
            }
            let end = ret.add(cnt) as usize;
            if end  > *self.end.get() {
                return core::ptr::null_mut();
            }
            *self.next_page.get() = end;
            ret
        }
    }

    fn init_block(&self, blk: *mut u8, list: &UnsafeCell<usize>, size: usize) {
        unsafe {
            if size == 4096 {
                // we just write a 0 at the start of the block
                *(blk as *mut usize) = 0 as usize;
                *list.get() = blk as usize;
            } else {
                // the first word is the size of the entries in this block, which we will use on dealloc()
                *(blk as *mut usize) = size;
                let max = blk.add(4096);
                // then each of the remaining words is a pointer to the next
                let mut wp = blk.add(size);
                *list.get() = wp as usize;
                let mut np = wp.add(size);
                while np < max {
                    *(wp as *mut usize) = np as usize;
                    wp = wp.add(size);
                    np = np.add(size);
                }
                *(wp as *mut usize) = 0 as usize; // mark the final pointer as full
            }
        }
    }
}