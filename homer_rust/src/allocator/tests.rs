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

    #[test]
    fn test_allocate_two_pages_if_block_is_8192_bytes() {
        let (start, pa) = simple_allocator(2);
        unsafe {
            let addr1 = pa.alloc(alloc::alloc::Layout::from_size_align(4096, 16).unwrap()) as usize;
            assert_eq!(addr1, start);
            let addr2 = pa.alloc(alloc::alloc::Layout::from_size_align(4096, 16).unwrap()) as usize;
            assert_eq!(addr2, start+4096);
            let oom = pa.alloc(alloc::alloc::Layout::from_size_align(4096, 16).unwrap()) as usize;
            assert_eq!(oom as *const u8, core::ptr::null());
        }
    }

    #[test]
    fn test_we_can_allocate_256_bytes_30_times_in_8192_bytes() {
        let (start, pa) = simple_allocator(2);
        unsafe {
            let mut i = 1;
            while i < 32 {
                let addr: usize = pa.alloc(alloc::alloc::Layout::from_size_align(256, 256).unwrap()) as usize;
                assert_eq!(addr, start+256*i, "i={}", i);
                i = i+1;
                if i == 16 { // 16 is the start of the second block, which is again used for size, so move on to 17
                    i = i+1;
                }
            }
            // test that a further allocation will be OOM
            let will_be_null: usize = pa.alloc(alloc::alloc::Layout::from_size_align(256, 256).unwrap()) as usize;
            assert_eq!(will_be_null as *const u8, core::ptr::null());
        }
    }

    #[test]
    fn test_allocate_deallocate_reallocate_first_page_reuses_block() {
        let (start, pa) = simple_allocator(1);
        unsafe {
            let l = alloc::alloc::Layout::from_size_align(4096, 16).unwrap();
            let addr = pa.alloc(l);
            assert_eq!(addr as usize, start);
            pa.dealloc(addr, l);
            let readdr = pa.alloc(l);
            assert_eq!(readdr as usize, start);
        }
    }

    #[test]
    fn test_allocate_deallocate_reallocate_two_pages_in_order_reuse_blocks() {
        let (start, pa) = simple_allocator(2);
        unsafe {
            let l = alloc::alloc::Layout::from_size_align(4096, 16).unwrap();
            let addr1 = pa.alloc(l);
            let addr2 = pa.alloc(l);
            assert_eq!(addr1 as usize, start);
            assert_eq!(addr2 as usize, start+4096);
            pa.dealloc(addr2, l);
            pa.dealloc(addr1, l);
            let readdr1 = pa.alloc(l);
            assert_eq!(readdr1 as usize, start);
            let readdr2 = pa.alloc(l);
            assert_eq!(readdr2 as usize, start+4096);
        }
    }

    #[test]
    fn test_allocate_deallocate_reallocate_two_pages_backwards_reuse_blocks_in_reverse_order() {
        let (start, pa) = simple_allocator(2);
        unsafe {
            let l = alloc::alloc::Layout::from_size_align(4096, 16).unwrap();
            let addr1 = pa.alloc(l);
            let addr2 = pa.alloc(l);
            assert_eq!(addr1 as usize, start);
            assert_eq!(addr2 as usize, start+4096);
            pa.dealloc(addr1, l);
            pa.dealloc(addr2, l);
            let readdr1 = pa.alloc(l);
            assert_eq!(readdr1 as usize, start+4096);
            let readdr2 = pa.alloc(l);
            assert_eq!(readdr2 as usize, start);
            let oom = pa.alloc(l);
            assert_eq!(oom as *const u8, core::ptr::null());
        }
    }

    #[test]
    fn test_allocate_deallocate_reallocate_two_16_byte_blocks_in_order_reuse_blocks() {
        let (start, pa) = simple_allocator(2);
        unsafe {
            let l = alloc::alloc::Layout::from_size_align(16, 16).unwrap();
            let addr1 = pa.alloc(l);
            let addr2 = pa.alloc(l);
            assert_eq!(addr1 as usize, start+16);
            assert_eq!(addr2 as usize, start+32);
            pa.dealloc(addr2, l);
            pa.dealloc(addr1, l);
            let readdr1 = pa.alloc(l);
            assert_eq!(readdr1 as usize, start+16);
            let readdr2 = pa.alloc(l);
            assert_eq!(readdr2 as usize, start+32);
        }
    }

    #[test]
    fn test_allocate_deallocate_reallocate_two_16_byte_blocks_in_reverse_order_reuse_blocks() {
        let (start, pa) = simple_allocator(2);
        unsafe {
            let l = alloc::alloc::Layout::from_size_align(16, 16).unwrap();
            let addr1 = pa.alloc(l);
            let addr2 = pa.alloc(l);
            assert_eq!(addr1 as usize, start+16);
            assert_eq!(addr2 as usize, start+32);
            pa.dealloc(addr1, l);
            pa.dealloc(addr2, l);
            let readdr2 = pa.alloc(l);
            assert_eq!(readdr2 as usize, start+32);
            let readdr1 = pa.alloc(l);
            assert_eq!(readdr1 as usize, start+16);
        }
    }

    #[test]
    fn test_allocate_deallocate_reallocate_two_256_byte_blocks_in_order_reuse_blocks() {
        let (start, pa) = simple_allocator(2);
        unsafe {
            let l = alloc::alloc::Layout::from_size_align(256, 256).unwrap();
            let addr1 = pa.alloc(l);
            let addr2 = pa.alloc(l);
            assert_eq!(addr1 as usize, start+256);
            assert_eq!(addr2 as usize, start+512);
            pa.dealloc(addr2, l);
            pa.dealloc(addr1, l);
            let readdr1 = pa.alloc(l);
            assert_eq!(readdr1 as usize, start+256);
            let readdr2 = pa.alloc(l);
            assert_eq!(readdr2 as usize, start+512);
        }
    }

    #[test]
    fn test_allocate_deallocate_reallocate_two_256_byte_blocks_in_reverse_order_reuse_blocks() {
        let (start, pa) = simple_allocator(1);
        unsafe {
            let l = alloc::alloc::Layout::from_size_align(256, 256).unwrap();
            let addr1 = pa.alloc(l);
            let addr2 = pa.alloc(l);
            assert_eq!(addr1 as usize, start+256);
            assert_eq!(addr2 as usize, start+512);
            pa.dealloc(addr1, l);
            pa.dealloc(addr2, l);
            let readdr2 = pa.alloc(l);
            assert_eq!(readdr2 as usize, start+512);
            let readdr1 = pa.alloc(l);
            assert_eq!(readdr1 as usize, start+256);
        }
    }

    #[test]
    fn test_allocate_a_big_block_as_multiple_pages() {
        let (start, pa) = simple_allocator(10);
        unsafe {
            let l = alloc::alloc::Layout::from_size_align(12000, 4096).unwrap();
            let addr = pa.alloc(l);
            assert_eq!(addr as usize, start);
        }
    }

    #[test]
    fn test_when_we_deallocate_a_big_block_it_goes_back_as_multiple_pages() {
        let (start, pa) = simple_allocator(4);
        unsafe {
            let l = alloc::alloc::Layout::from_size_align(12000, 4096).unwrap();
            let addr = pa.alloc(l);
            assert_eq!(addr as usize, start);
            
            // now allocate the next block and check it's where we think
            let al = alloc::alloc::Layout::from_size_align(2000, 4096).unwrap();
            let after = pa.alloc(al);
            assert_eq!(after as usize, start + 4096*3);

            // deallocate the big block; we should now get three pages back (in order)
            pa.dealloc(addr, l);

            let a1 = pa.alloc(al);
            let a2 = pa.alloc(al);
            let a3 = pa.alloc(al);
            let zero = pa.alloc(al);

            assert_eq!(a1 as usize, start);
            assert_eq!(a2 as usize, start + 4096);
            assert_eq!(a3 as usize, start + 8192);
            assert_eq!(zero, core::ptr::null_mut());
        }
    }

    #[test]
    fn test_after_we_deallocate_a_big_block_the_next_big_block_comes_from_fresh_memory() {
        let (start, pa) = simple_allocator(6);
        unsafe {
            let l = alloc::alloc::Layout::from_size_align(12000, 4096).unwrap();
            let addr = pa.alloc(l);
            assert_eq!(addr as usize, start);
            
            pa.dealloc(addr, l);

            let addr = pa.alloc(l);
            assert_eq!(addr as usize, start + 3 * 4096);

            let al = alloc::alloc::Layout::from_size_align(2000, 4096).unwrap();
            let a1 = pa.alloc(al);
            let a2 = pa.alloc(al);
            let a3 = pa.alloc(al);
            let zero = pa.alloc(al);

            assert_eq!(a1 as usize, start);
            assert_eq!(a2 as usize, start + 4096);
            assert_eq!(a3 as usize, start + 8192);
            assert_eq!(zero, core::ptr::null_mut());
        }
    }

    fn simple_allocator(npages: usize) -> (usize, PageAllocator<Box<dyn Fn() -> (usize,usize)>>) {
        unsafe {
            let blk = alloc::alloc::alloc(alloc::alloc::Layout::from_size_align(4096 * npages, 4096).unwrap());
            let start = (blk as *const _) as usize;
            assert_ne!(start, 0);
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