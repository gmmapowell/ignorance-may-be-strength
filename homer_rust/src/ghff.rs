// Support the GIMP header file format

static mut BUF:[u8;6] = [0;6];
static mut BUF8:[u8;8] = [0;8];
static mut IMAGE:[u8;HOMER_BYTES] = [0;HOMER_BYTES];

pub const HOMER_HEIGHT : u32 = 64;
pub const HOMER_WIDTH : u32 = 96;
pub const HOMER_BYTES : usize = (HOMER_HEIGHT * HOMER_WIDTH * 4) as usize;

pub fn read_homer(homer: &str) -> &'static[u8;HOMER_BYTES] {
    unsafe {
        let mut pos : usize = 0;
        while pos < homer.len() {
            let c0 = homer.as_bytes()[pos];
            let c1 = homer.as_bytes()[pos+1];
            let c2 = homer.as_bytes()[pos+2];
            let c3 = homer.as_bytes()[pos+3];

            IMAGE[pos] = ((c0-33) << 2) | ((c1-33) >> 4);
            IMAGE[pos+1] = ((c1-33) << 4) | ((c2-33) >> 2);
            IMAGE[pos+2] = ((c2-33) << 6) | ((c3-33));
            IMAGE[pos+3] = 0;
           pos+=4;
        }
        &IMAGE
    }
}

pub fn hex24(n : u32) -> &'static[u8;6] {
    unsafe {
        BUF[0] = digit((n >> 20) & 0xf);
        BUF[1] = digit((n >> 16) & 0xf);
        BUF[2] = digit((n >> 12) & 0xf);
        BUF[3] = digit((n >> 8) & 0xf);
        BUF[4] = digit((n >> 4) & 0xf);
        BUF[5] = digit(n & 0xf);
        &BUF
    }
}


pub fn hex32(n : u32) -> &'static[u8;8] {
    unsafe {
        BUF8[0] = digit((n >> 28) & 0xf);
        BUF8[1] = digit((n >> 24) & 0xf);
        BUF8[2] = digit((n >> 20) & 0xf);
        BUF8[3] = digit((n >> 16) & 0xf);
        BUF8[4] = digit((n >> 12) & 0xf);
        BUF8[5] = digit((n >> 8) & 0xf);
        BUF8[6] = digit((n >> 4) & 0xf);
        BUF8[7] = digit(n & 0xf);
        &BUF8
    }
}

fn digit(n: u32) -> u8 {
    if n < 10 {
        ((48 + n) & 0xff) as u8
    } else {
        (55 + n) as u8
    }
}