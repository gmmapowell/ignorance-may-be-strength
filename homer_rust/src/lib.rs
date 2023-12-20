#![no_std]

mod homer;
mod ghff;
use core::ptr::read_volatile;
use core::ptr::write_volatile;

use crate::homer::HOMER_DATA;
use crate::ghff::HOMER_BYTES;
use crate::ghff::HOMER_WIDTH;
use crate::ghff::HOMER_HEIGHT;
use crate::ghff::hex24;
use crate::ghff::hex32;
use crate::ghff::read_homer;

// raspi2 and raspi3 have peripheral base address 0x3F000000,
// but raspi1 has peripheral base address 0x20000000. Ensure
// you are using the correct peripheral address for your
// hardware.
const UART_DR: u32 = 0x3F201000;
const UART_FR: u32 = 0x3F201018;

// This is an all-but-random number which is used everywhere (see above)
// but the best authority I have is https://forums.raspberrypi.com//viewtopic.php?t=142439#p941751
const PERIPHERAL_BASE: u32 = 0x3F000000;

// I just have nothing for this random number, other than other code
// But it would appear to be where to send mailbox messages to the GPU
// Offset from the PERIPHERAL_BASE
const MBOX_BASE: u32 = 0x0000B880;

// The best I can do for this is the table at https://github.com/raspberrypi/firmware/wiki/Mailboxes#mailbox-registers
const MBOX_STATUS_OFFSET: u32 = 0x18;
const MBOX_WRITE_OFFSET: u32 = 0x20;

// So now we can combine all these things to make the actual address we want
const MBOX_STATUS: u32 = PERIPHERAL_BASE | MBOX_BASE | MBOX_STATUS_OFFSET;
const MBOX_WRITE: u32 = PERIPHERAL_BASE | MBOX_BASE | MBOX_WRITE_OFFSET;


// Flags to look at in the mailbox

// If the mailbox is already in use and has not been cleared, we need to wait ...
const MBOX_BUSY: u32 = 0x80000000;

// If the mailbox has seen our request but has not yet responded, we need to wait ...
const MBOX_PENDING: u32 = 0x40000000;

struct FrameBufferInfo {
    width : u32,
    height : u32,
    pitch: u32,
    base_addr: u32
}

fn mmio_write(reg: u32, val: u32) {
    unsafe { write_volatile(reg as *mut u32, val) }
}

fn mmio_read(reg: u32) -> u32 {
    unsafe { read_volatile(reg as *const u32) }
}

fn transmit_fifo_full() -> bool {
    mmio_read(UART_FR) & (1 << 5) > 0
}

fn receive_fifo_empty() -> bool {
    mmio_read(UART_FR) & (1 << 4) > 0
}

fn writec(c: u8) {
    while transmit_fifo_full() {}
    mmio_write(UART_DR, c as u32);
}

fn getc() -> u8 {
    while receive_fifo_empty() {}
    mmio_read(UART_DR) as u8
}

fn write(msg: &str) {
    for c in msg.chars() {
        writec(c as u8)
    }
}

fn write_6_chars(msg: &[u8;6]) {
    for c in msg {
        writec(*c)
    }
}

fn write_8_chars(msg: &[u8;8]) {
    for c in msg {
        writec(*c)
    }
}

#[no_mangle]
pub extern fn kernel_main() {
    let mut fb = FrameBufferInfo{width: 0, height: 0, pitch: 0, base_addr: 0};
    lfb_init(&mut fb);
    let homer: &[u8; HOMER_BYTES] = read_homer(HOMER_DATA);
    show_homer(&fb, &homer);

    let mut off : usize = 0;
    while off < 200 {
        let x : u32 =
        (homer[off + 0] as u32) << 24 |
        (homer[off + 1] as u32) << 16 |
        (homer[off + 2] as u32) << 8 |
        (homer[off + 3] as u32);
        write_6_chars(hex24(x));
        writec(32);
        off += 4;
        if off % 40 == 0 {
            writec(10);
        }
    }
    // write(HOMER_DATA);
    loop {
        writec(getc())
    }
}

// For more information, you may want to start at
// https://github.com/raspberrypi/firmware/wiki/Mailbox-property-interface

fn lfb_init(fb : &mut FrameBufferInfo) {
    let mut buf: [u32;36] = [0; 36];

    // The header of the message has a length and a status (0 = REQUEST; 0x8000xxxx = RESPONSE)
    buf[0] = 35 * 4; // the buffer has 35 4-byte words
    buf[1] = 0; // we indicate we are sending a MBOX_REQUEST as 0

    // Now each of the tags

    // First, set the physical size of the framebuffer to 1024 x 768
    buf[2] = 0x48003;
    buf[3] = 8; // the number of bytes in the request value
    buf[4] = 0; // reserved in request - will be used for the length of the response value
    buf[5] = 1024; // the requested width
    buf[6] = 768; // the requested height

    // Now, set the virtual size of the framebuffer
    // This must be at least as big as the physical framebuffer, but can be bigger, e.g. to support double buffering
    // or to support scrolling
    buf[7] = 0x48004;
    buf[8] = 8;
    buf[9] = 0;
    buf[10] = 1024; // the requested virtual width
    buf[11] = 768; // the requested virtual height

    // Now specify where the physical framebuffer is in the virtual framebuffer
    buf[12] = 0x48009;
    buf[13] = 8;
    buf[14] = 0;
    buf[15] = 0;
    buf[16] = 0;

    // Now set the depth of the framebuffer in bits.  This is 32, presumably to get 24 bits aligned nicely
    buf[17] = 0x48005;
    buf[18] = 4;
    buf[19] = 0;
    buf[20] = 32; // allocate 32 bits per pixel

    // choose RGB over BGR
    buf[21] = 0x48006;
    buf[22] = 4;
    buf[23] = 0;
    buf[24] = 1; // 1 = RGB, 0 = BGR

    // Now we are ready to allocate the buffer.
    buf[25] = 0x40001;
    buf[26] = 8;  // we are only sending 4 bytes, but we want 8 bytes back
    buf[27] = 0;
    buf[28] = 4096; // the modulus of the alignment we want (i.e. only the top 20 bits are significant)
    buf[29] = 0;

    // And we want to check that we were given RGB (or not)
    buf[30] = 0x40008;
    buf[31] = 4;
    buf[32] = 0;
    buf[33] = 0; // this is just a placeholder for the value to come back

    // We have no more tags
    buf[34] = 0;

    // avoid a SEGV in the emulator
    let mut y = 0;
    while y < 1000000 {
        y = y + 1;
        mmio_read(MBOX_STATUS); // do something to waste time
    }
    
    mbox_send(8, &mut buf);

    let volbuf = &mut buf as *mut u32;
    fb.width = unsafe { read_volatile(volbuf.add(5)) };
    fb.height = unsafe { read_volatile(volbuf.add(6)) };
    fb.pitch = unsafe { read_volatile(volbuf.add(33)) };
    fb.base_addr = unsafe { read_volatile(volbuf.add(28)) } & 0x3fffffff;
}

fn show_homer(fb : &FrameBufferInfo, homer : &[u8; HOMER_BYTES]) {
    // Because we want to put Homer in the middle of the screen, we need to first figure out where
    // he should go.  We have a framebuffer width and height, and a homer width and height.
    // So we need to put half of the distance in each direction as an initial value for x and y

    let xoff = fb.width/2 - HOMER_WIDTH/2;
    let yoff = fb.height/2 - HOMER_HEIGHT/2;

    // Now we want to go over each of the scan lines, having the ptr be the base (from fb.base_addr)
    // plus the current y multiplied by the pitch, plus the above xoff

    let mut homer_index: usize = 0;
    let mut y = 0;
    while y < HOMER_HEIGHT {
        let ptr = fb.base_addr + (yoff + y) * fb.pitch + xoff*4;
        let mut x: u32 = 0;
        while x < HOMER_WIDTH {
            unsafe { *((ptr + x*4 + 0) as *mut u8) = homer[homer_index + 0]; }
            unsafe { *((ptr + x*4 + 1) as *mut u8) = homer[homer_index + 1]; }
            unsafe { *((ptr + x*4 + 2) as *mut u8) = homer[homer_index + 2]; }
            unsafe { *((ptr + x*4 + 3) as *mut u8) = homer[homer_index + 3]; }
            x += 1;
            homer_index += 4;
        }
        y += 1;
    }
}

fn mbox_send(ch: u8, buf: &mut[u32; 36]) {
    while mmio_read(MBOX_STATUS) & MBOX_BUSY != 0 {
    }

    // obtain the address of buf as a raw pointer
    let volbuf = buf as *const u32;

    // then convert that to just a plain integer
    let ptr:u32 = volbuf as u32;

    // what we pass to the mailbox is that in the top 28 bits and the channel number (ch) in the bottom 4 bits
    let addr = (ptr & !0x0F) | ((ch as u32) & 0x0f);

    // send to the mailbox write address
    mmio_write(MBOX_WRITE, addr);

    // wait until we have a response from the GPU
    while mmio_read(MBOX_STATUS) & MBOX_PENDING != 0 {
    }

    // show the returned buffer contents
    write("returned buffer contents:\n");
    let mut x = 0;
    while x < 36 {
        write_8_chars(hex32(buf[x]));
        write("\n");
        x = x + 1;
    }
    
    // The compiler optimizes away (or something) reads into buf and returns what we wrote
    // We need to be sure we read what was written
    let stat = unsafe { read_volatile(volbuf.add(1)) };
    
    // test that we received valid data
    if stat != 0x80000000 {
        write("error returned from getfb ");
        write_8_chars(hex32(stat));
        write("\n");
        return;
    }

    let pixdepth = unsafe { read_volatile(volbuf.add(20)) };
    if pixdepth != 32 {
        write("pixel depth is not 32");
        return;
    }

    let alignment = unsafe { read_volatile(volbuf.add(28)) };
    if alignment == 0 {
        write("alignment is zero");
        return;
    }
}
