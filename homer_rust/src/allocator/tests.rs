#[cfg(test)]
mod tests {
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
            next_page: UnsafeCell::new(4096),
            free_16: UnsafeCell::new(0),
            free_256: UnsafeCell::new(0),
            free_4096: UnsafeCell::new(0)        
        }
    }
}