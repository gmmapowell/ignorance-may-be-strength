#![no_std]
extern crate alloc;
    
mod homer;
mod ghff;
mod allocator;
use core::ptr::read_volatile;
use core::ptr::write_volatile;

use crate::homer::HOMER_DATA;
use crate::ghff::HOMER_BYTES;
use crate::ghff::HOMER_WIDTH;
use crate::ghff::HOMER_HEIGHT;
use crate::ghff::hex32;
use crate::ghff::read_homer;

const ALT0: u32 = 0b100;

// This is an all-but-random number which is used everywhere (see above)
// but the best authority I have is https://forums.raspberrypi.com//viewtopic.php?t=142439#p941751
const PERIPHERAL_BASE: u32 = 0x3F000000;

// This is the base offset of the GPIO registers.
// See https://www.raspberrypi.org/app/uploads/2012/02/BCM2835-ARM-Peripherals.pdf, Section 6
const GPIO_BASE: u32 = 0x00200000;

const GPPUD: u32 = PERIPHERAL_BASE + GPIO_BASE + 0x94;
const GPPUDCLK0: u32 = PERIPHERAL_BASE + GPIO_BASE + 0x98;

const UART_BASE: u32 = 0x00201000;
const UART_DR: u32 = PERIPHERAL_BASE + UART_BASE + 0x00;
const UART_FR: u32 = PERIPHERAL_BASE + UART_BASE + 0x18;
const UART_IBRD: u32 = PERIPHERAL_BASE + UART_BASE + 0x24;
const UART_FBRD: u32 = PERIPHERAL_BASE + UART_BASE + 0x28;
const UART_LCRH: u32 = PERIPHERAL_BASE + UART_BASE + 0x2c;
const UART_CR: u32 = PERIPHERAL_BASE + UART_BASE + 0x30;
const UART_ICR: u32 = PERIPHERAL_BASE + UART_BASE + 0x44;

// I just have nothing for this random number, other than other code
// But it would appear to be where to send mailbox messages to the GPU
// Offset from the PERIPHERAL_BASE
const MBOX_BASE: u32 = 0x0000B880;

// The best I can do for this is the table at https://github.com/raspberrypi/firmware/wiki/Mailboxes#mailbox-registers
const MBOX_READ_OFFSET: u32 = 0x0;
const MBOX_STATUS_OFFSET: u32 = 0x18;
const MBOX_WRITE_OFFSET: u32 = 0x20;

// So now we can combine all these things to make the actual address we want
const MBOX_STATUS: u32 = PERIPHERAL_BASE | MBOX_BASE | MBOX_STATUS_OFFSET;
const MBOX_WRITE: u32 = PERIPHERAL_BASE | MBOX_BASE | MBOX_WRITE_OFFSET;
const MBOX_READ: u32 = PERIPHERAL_BASE | MBOX_BASE | MBOX_READ_OFFSET;

// Flags to look at in the mailbox

// If the mailbox is already in use and has not been cleared, we need to wait ...
const MBOX_BUSY: u32 = 0x80000000;

// If the mailbox has seen our request but has not yet responded, we need to wait ...
const MBOX_PENDING: u32 = 0x40000000;

#[derive(PartialEq)]
enum PixelOrder {
    BGR,
    RGB
}

struct FrameBufferInfo {
    width : u32,
    height : u32,
    pitch: u32,
    base_addr: u32,
    pixorder: PixelOrder
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

fn write_8_chars(msg: &[u8;8]) {
    for c in msg {
        writec(*c)
    }
}

#[no_mangle]
pub extern fn kernel_main() {
    avoid_emulator_segv();
    uart_init();
    let mut fb = FrameBufferInfo{width: 0, height: 0, pitch: 0, base_addr: 0, pixorder: PixelOrder::RGB};
    lfb_init(&mut fb);
    let homer: &[u8; HOMER_BYTES] = read_homer(HOMER_DATA);
    show_homer(&fb, &homer);

    loop {
        writec(getc())
    }
}

#[repr(align(16))]
struct Message {
    pub buf: [u32; 36]
}

#[no_mangle]
pub extern fn memset(mut buf: *mut u8, val: u8, cnt: usize) {
    let mut i=0;
    while i<cnt {
        unsafe { *buf = val;
            buf = buf.add(1);
        }
        i+=1;

    }
}

#[no_mangle]
pub extern fn memcpy(mut dest: *mut u8, mut src: *const u8, cnt: usize) {
    let mut i=0;
    while i<cnt {
        unsafe { *dest = *src;
            dest = dest.add(1);
            src = src.add(1);
        }
        i+=1;
    }
}

// For more information, you may want to start at
// https://github.com/raspberrypi/firmware/wiki/Mailbox-property-interface

fn uart_init() {
    // Turn off UART0 while we configure it
    mmio_write(UART_CR, 0);

    // Now, set the UART clock (yes, the Raspberry Pi seems 
    // to have about 10 separate clocks) to 4MHz.
    let mut buf: [u32;36] = [0; 36];

    buf[0] = 9 * 4; // this message has 9 4-byte words
    buf[1] = 0;
    buf[2] = 0x38002; // set one of the clock rates
    buf[3] = 12; // request has three words of data
    buf[4] = 0;  // space for response length, but is zero for request
    buf[5] = 2;  // 2 selects the "UART" clock
    buf[6] = 4000000; // set it to 4MHz
    buf[7] = 0;  // avoid setting "turbo" mode
    buf[8] = 0;

    let mut msg = Message { buf: buf };
    mbox_send(8, &mut msg.buf);

    let mut fs1 = gpfsel_read(1);
    
    gpf_select(&mut fs1, 4, ALT0);
    gpf_select(&mut fs1, 5, ALT0);
    gpfsel_write(1, fs1);

    mmio_write(GPPUD, 0);
    wait_a_while(150);
    mmio_write(GPPUDCLK0, (1<<14) | (1<<15));
    wait_a_while(150);
    mmio_write(GPPUDCLK0, 0);

    mmio_write(UART_ICR, 0x7ff);
    mmio_write(UART_IBRD, 2);
    mmio_write(UART_FBRD, 11);
    mmio_write(UART_LCRH, 0x70);
    mmio_write(UART_CR, 0x301); // Enable UART with Rx and Tx
}

fn gpfsel_read(reg: u32) -> u32 {
    let addr = PERIPHERAL_BASE + GPIO_BASE + (reg*4);
    mmio_read(addr)
}

fn gpf_select(flags: &mut u32, pos: u32, fun: u32) {
    let lsb = pos * 3;
    *flags = *flags & !(7 << lsb); // clear these bits
    *flags = *flags | (fun << lsb);  // set these bits
}

fn gpfsel_write(reg: u32, value: u32) {
    let addr = PERIPHERAL_BASE + GPIO_BASE + (reg*4);
    mmio_write(addr, value);
}

fn wait_a_while(mut ncycles: u32) {
    while ncycles > 0 {
        ncycles -= 1;
    }
}

fn lfb_init(fb : &mut FrameBufferInfo) {
    let mut buf: &mut [u32] = allocate_message_buffer(35);

    write_8_chars(hex32(buf.as_ptr() as u32));
    write("\r\n");

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

    // And we want to check the pitch we received
    buf[30] = 0x40008;
    buf[31] = 4;
    buf[32] = 0;
    buf[33] = 0; // this is just a placeholder for the value to come back

    // We have no more tags
    buf[34] = 0;

    mbox_send(8, &mut buf);

    let volbuf: *mut u32 = buf.as_mut_ptr();
    
    // The compiler optimizes away (or something) reads into buf and returns what we wrote
    // We need to be sure we read what was written
    let stat = unsafe { read_volatile(volbuf.add(1)) };
    
    // test that we received valid data
    if stat != 0x80000000 {
        write("error returned from getfb ");
        write_8_chars(hex32(stat));
        write("\r\n");
        return;
    }

    let pixdepth = unsafe { read_volatile(volbuf.add(20)) };
    if pixdepth != 32 {
        write("pixel depth is not 32\r\n");
        return;
    }

    let pixorder = unsafe { read_volatile(volbuf.add(24)) };
    write("pixel order is ");
    write_8_chars(hex32(pixorder));
    write("\r\n");

    let alignment = unsafe { read_volatile(volbuf.add(28)) };
    if alignment == 0 {
        write("alignment is zero\r\n");
        return;
    }

    fb.width = unsafe { read_volatile(volbuf.add(5)) };
    fb.height = unsafe { read_volatile(volbuf.add(6)) };
    fb.pitch = unsafe { read_volatile(volbuf.add(33)) };
    fb.base_addr = unsafe { read_volatile(volbuf.add(28)) } & 0x3fffffff;
    fb.pixorder = if pixorder == 1 { PixelOrder::RGB } else { PixelOrder::BGR };
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
            if fb.pixorder == PixelOrder::RGB {
                unsafe { *((ptr + x*4 + 0) as *mut u8) = homer[homer_index + 0]; }
                unsafe { *((ptr + x*4 + 1) as *mut u8) = homer[homer_index + 1]; }
                unsafe { *((ptr + x*4 + 2) as *mut u8) = homer[homer_index + 2]; }
                unsafe { *((ptr + x*4 + 3) as *mut u8) = homer[homer_index + 3]; }
            } else {
                unsafe { *((ptr + x*4 + 2) as *mut u8) = homer[homer_index + 0]; }
                unsafe { *((ptr + x*4 + 1) as *mut u8) = homer[homer_index + 1]; }
                unsafe { *((ptr + x*4 + 0) as *mut u8) = homer[homer_index + 2]; }
                unsafe { *((ptr + x*4 + 3) as *mut u8) = homer[homer_index + 3]; }
            }
            x += 1;
            homer_index += 4;
        }
        y += 1;
    }
}

fn avoid_emulator_segv() {
        // avoid a SEGV in the emulator
        let mut y = 0;
        while y < 1000000 {
            y = y + 1;
            mmio_read(MBOX_STATUS); // do something to waste time
        }    
}

fn mbox_send(ch: u8, buf: &mut[u32]) {
    while mmio_read(MBOX_STATUS) & MBOX_BUSY != 0 {
    }

    // obtain the address of buf as a raw pointer
    let volbuf = buf.as_mut_ptr();

    // then convert that to just a plain integer
    let ptr:u32 = volbuf as u32;

    // what we pass to the mailbox is that in the top 28 bits and the channel number (ch) in the bottom 4 bits
    let addr = (ptr & !0x0F) | ((ch as u32) & 0x0f);

    // send to the mailbox write address
    mmio_write(MBOX_WRITE, addr);

    // wait until we have a response from the GPU
    while mmio_read(MBOX_STATUS) & MBOX_PENDING != 0 {
    }

    loop {
        let rb = mmio_read(MBOX_READ);
        if rb == addr {
            break;
        }
    }
}

fn allocate_message_buffer(nwords: usize) -> &'static mut [u32] {
    unsafe {
        let ptr = alloc::alloc::alloc(alloc::alloc::Layout::from_size_align_unchecked(nwords * 4, 16)) as *mut u32;
        alloc::slice::from_raw_parts_mut(ptr, nwords)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_set_4_in_1_from_0() {
        let mut val = 0;
        gpf_select(&mut val, 1, ALT0);
        assert_eq!(val, 0b100000);
    }
}