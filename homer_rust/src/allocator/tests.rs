#[cfg(test)]
mod tests {
    use crate::allocator::PageAllocator;
    use core::{cell::UnsafeCell, alloc::GlobalAlloc};
    use alloc::boxed::Box;

    #[test]
    fn test_allocate_first_page() {
        let (start, pa) = simple_allocator(1);
        unsafe {
            let addr = pa.alloc(alloc::alloc::Layout::from_size_align(4096, 16).unwrap()) as usize;
            assert_eq!(addr, start);
        }
    }

    #[test]
    fn test_cannot_allocate_second_page_when_only_one() {
        let (_, pa) = simple_allocator(1);
        unsafe {
            let _ = pa.alloc(alloc::alloc::Layout::from_size_align(4096, 16).unwrap()) as usize;
            let addr2 = pa.alloc(alloc::alloc::Layout::from_size_align(4096, 16).unwrap()) as usize;
            assert_eq!((core::ptr::null_mut() as *const u8) as usize, addr2);
        }
    }

    #[test]
    fn test_allocate_16_bytes_is_16_beyond_start() {
        let (start, pa) = simple_allocator(1);
        unsafe {
            let addr = pa.alloc(alloc::alloc::Layout::from_size_align(16, 16).unwrap()) as usize;
            assert_eq!(addr, start+16);
        }
    }

    #[test]
    fn test_we_can_allocate_16_bytes_255_times() {
        let (start, pa) = simple_allocator(1);
        unsafe {
            let mut i = 1;
            while i < 256 {
                let addr: usize = pa.alloc(alloc::alloc::Layout::from_size_align(16, 16).unwrap()) as usize;
                assert_eq!(addr, start+16*i, "i={}", i);
                i = i+1;
            }
            // test that a further allocation will be OOM
            let will_be_null: usize = pa.alloc(alloc::alloc::Layout::from_size_align(16, 16).unwrap()) as usize;
            assert_eq!(will_be_null as *const u8, core::ptr::null());
        }
    }

    #[test]
    fn test_allocate_256_bytes_is_256_beyond_start() {
        let (start, pa) = simple_allocator(1);
        unsafe {
            let addr = pa.alloc(alloc::alloc::Layout::from_size_align(256, 256).unwrap()) as usize;
            assert_eq!(addr, start+256);
        }
    }

    #[test]
    fn test_we_can_allocate_256_bytes_15_times() {
        let (start, pa) = simple_allocator(1);
        unsafe {
            let mut i = 1;
            while i < 16 {
                let addr: usize = pa.alloc(alloc::alloc::Layout::from_size_align(256, 256).unwrap()) as usize;
                assert_eq!(addr, start+256*i, "i={}", i);
                i = i+1;
            }
            // test that a further allocation will be OOM
            let will_be_null: usize = pa.alloc(alloc::alloc::Layout::from_size_align(256, 256).unwrap()) as usize;
            assert_eq!(will_be_null as *const u8, core::ptr::null());
        }
    }

    #[test]
    fn test_allocating_10_bytes_is_the_same_as_16() {
        let (start, pa) = simple_allocator(1);
        unsafe {
            let addr = pa.alloc(alloc::alloc::Layout::from_size_align(10, 4).unwrap()) as usize;
            assert_eq!(addr, start+16);
        }
    }

    #[test]
    fn test_allocating_17_bytes_is_the_same_as_256() {
        let (start, pa) = simple_allocator(1);
        unsafe {
            let addr = pa.alloc(alloc::alloc::Layout::from_size_align(17, 8).unwrap()) as usize;
            assert_eq!(addr, start+256);
        }
    }

    fn simple_allocator(npages: usize) -> (usize, PageAllocator<Box<dyn Fn() -> (usize,usize)>>) {
        unsafe {
            let blk = alloc::alloc::alloc(alloc::alloc::Layout::from_size_align(4096 * npages, 16).unwrap());
            let start = (blk as *const _) as usize;
            let f = move || { (start, start+4096 * npages) };
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