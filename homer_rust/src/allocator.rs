use core::alloc::GlobalAlloc;

extern {
    pub static __heap_start : *mut u8;
}

#[allow(non_upper_case_globals)]
#[no_mangle]
pub static __rust_no_alloc_shim_is_unstable: u8 = 0;

#[global_allocator]
static HEAP: HeapAllocator = HeapAllocator {
};

struct HeapAllocator {
}

unsafe impl GlobalAlloc for HeapAllocator {
    unsafe fn alloc(&self, _layout: core::alloc::Layout) -> *mut u8 {
        // just return the top of heap
        (&__heap_start as *const _) as *mut u8
    }

    unsafe fn dealloc(&self, _ptr: *mut u8, _layout: core::alloc::Layout) {
        // we don't support deallocation yet
    }
}