#[cfg(test)]
mod tests {
    use crate::allocator::PageAllocator;
    use core::{cell::UnsafeCell, alloc::GlobalAlloc};
    use alloc::boxed::Box;

    #[test]
    fn test_allocate_first_page() {
        let (start, pa) = simple_allocator();
        unsafe {
            let addr = pa.alloc(alloc::alloc::Layout::from_size_align(4096, 16).unwrap()) as usize;
            assert_eq!(addr, start);
        }
    }

    fn simple_allocator() -> (usize, PageAllocator<Box<dyn Fn() -> (usize,usize)>>) {
        unsafe {
            let blk = alloc::alloc::alloc(alloc::alloc::Layout::from_size_align(4096, 16).unwrap());
            let start = (blk as *const _) as usize;
            let f = move || { (start, start+4096) };
            (start, PageAllocator{
                next_page: UnsafeCell::new(0),
                end: UnsafeCell::new(0),
                free_16: UnsafeCell::new(0),
                free_256: UnsafeCell::new(0),
                free_4096: UnsafeCell::new(0),
                init: Box::new(f)
            })
        }
    }
}