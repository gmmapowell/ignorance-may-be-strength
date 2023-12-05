#![no_std]

mod homer;
mod ghff;
use core::ptr::read_volatile;
use core::ptr::write_volatile;
// use crate::homer::HOMER_DATA;
use crate::ghff::hex;

// raspi2 and raspi3 have peripheral base address 0x3F000000,
// but raspi1 has peripheral base address 0x20000000. Ensure
// you are using the correct peripheral address for your
// hardware.
const UART_DR: u32 = 0x3F201000;
const UART_FR: u32 = 0x3F201018;

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

fn write_chars(msg: &[u8;6]) {
    for c in msg {
        writec(*c)
    }
}

#[no_mangle]
pub extern fn kernel_main() {
    write_chars(hex(0x9a3cb0));
    // write(HOMER_DATA);
    loop {
        writec(getc())
    }
}
