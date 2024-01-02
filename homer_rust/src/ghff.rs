// Support the GIMP header file format

pub const HOMER_HEIGHT : u32 = 64;
pub const HOMER_WIDTH : u32 = 96;
pub const HOMER_BYTES : usize = (HOMER_HEIGHT * HOMER_WIDTH * 4) as usize;

pub fn read_homer(homer: &str) -> &'static[u8] {
    unsafe {
        let ptr = alloc::alloc::alloc(alloc::alloc::Layout::from_size_align_unchecked(HOMER_BYTES, 16));
        let image = alloc::slice::from_raw_parts_mut(ptr, HOMER_BYTES);

        let mut pos : usize = 0;
        while pos < homer.len() {
            let c0 = homer.as_bytes()[pos];
            let c1 = homer.as_bytes()[pos+1];
            let c2 = homer.as_bytes()[pos+2];
            let c3 = homer.as_bytes()[pos+3];

            image[pos] = ((c0-33) << 2) | ((c1-33) >> 4);
            image[pos+1] = ((c1-33) << 4) | ((c2-33) >> 2);
            image[pos+2] = ((c2-33) << 6) | ((c3-33));
            image[pos+3] = 0;
            pos+=4;
        }
        image
    }
}

pub fn hex32(n : u32) -> &'static str {
    unsafe {
        let buf = alloc::alloc::alloc(alloc::alloc::Layout::from_size_align_unchecked(8, 4));
        
        let arr = alloc::slice::from_raw_parts_mut(buf, 8);
        arr[0] = digit((n >> 28) & 0xf);
        arr[1] = digit((n >> 24) & 0xf);
        arr[2] = digit((n >> 20) & 0xf);
        arr[3] = digit((n >> 16) & 0xf);
        arr[4] = digit((n >> 12) & 0xf);
        arr[5] = digit((n >> 8) & 0xf);
        arr[6] = digit((n >> 4) & 0xf);
        arr[7] = digit(n & 0xf);
        core::str::from_utf8_unchecked(arr)
    }
}

fn digit(n: u32) -> u8 {
    if n < 10 {
        ((48 + n) & 0xff) as u8
    } else {
        (55 + n) as u8
    }
}