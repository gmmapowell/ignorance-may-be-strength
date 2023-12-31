#[cfg(test)]
mod tests {
    #[no_mangle]
    pub static __heap_start :u32 = 0;
    #[no_mangle]
    pub static __heap_end :u32 = 0;

    use crate::allocator::PageAllocator;
    use core::{cell::UnsafeCell, alloc::GlobalAlloc};

    #[test]
    fn test_allocate_first_page() {
        let pa = simple_allocator();
        unsafe {
            let addr = pa.alloc(alloc::alloc::Layout::from_size_align(4096, 16).unwrap()) as usize;
            assert_eq!(addr, 4096);
        }
    }

    fn simple_allocator() -> PageAllocator {
        return PageAllocator{
            next_page: UnsafeCell::new(0),
            free_16: UnsafeCell::new(0),
            free_256: UnsafeCell::new(0),
            free_4096: UnsafeCell::new(0)        
        }
    }
}