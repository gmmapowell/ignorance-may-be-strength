// Support the GIMP header file format

static mut BUF:[u8;6] = [0;6];
static mut IMAGE:[u8;HOMER_BYTES] = [0;HOMER_BYTES];

const HOMER_HEIGHT : u32 = 64;
const HOMER_WIDTH : u32 = 96;
pub const HOMER_BYTES : usize = (HOMER_HEIGHT * HOMER_WIDTH * 4) as usize;

pub fn read_homer(homer: &str) -> &'static[u8;HOMER_BYTES] {
    unsafe {
        let mut pos : usize = 0;
        while pos < homer.len() {
            let c0 = homer.as_bytes()[pos];
            let c1 = homer.as_bytes()[pos+1];
            let c2 = homer.as_bytes()[pos+2];
            let c3 = homer.as_bytes()[pos+3];

            IMAGE[pos] = 0;
            IMAGE[pos+1] = ((c0-33) << 2) | ((c1-33) >> 4);
            IMAGE[pos+2] = ((c1-33) << 4) | ((c2-33) >> 2);
            IMAGE[pos+3] = ((c2-33) << 6) | ((c3-33));
            pos+=4;
        }
        &IMAGE
    }
}

pub fn hex(n : u32) -> &'static[u8;6] {
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

fn digit(n: u32) -> u8 {
    if n < 10 {
        ((48 + n) & 0xff) as u8
    } else {
        (55 + n) as u8
    }
}