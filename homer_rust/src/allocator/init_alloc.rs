#[cfg(not(test))]
mod init_alloc {
    use crate::allocator::PageAllocator;
    use core::cell::UnsafeCell;

    extern {
        pub static __heap_start : u32;
        pub static __heap_end : u32;
    }
    
    #[allow(non_upper_case_globals)]
    #[no_mangle]
    pub static __rust_no_alloc_shim_is_unstable: u8 = 0;

    #[global_allocator]
    static HEAP: PageAllocator<fn()->(usize,usize)> = PageAllocator {
        next_page: UnsafeCell::new(0),
        end: UnsafeCell::new(0),
        free_16: UnsafeCell::new(0),
        free_256: UnsafeCell::new(0),
        free_4096: UnsafeCell::new(0),
        init: init_from_heap
    };

    fn init_from_heap() -> (usize, usize) {
        unsafe { ((&__heap_start as *const _) as usize, (&__heap_end as *const _) as usize) }
    }    
}
