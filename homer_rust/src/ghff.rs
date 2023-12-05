// Support the GIMP header file format

static mut BUF:[u8;6] = [0;6];

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