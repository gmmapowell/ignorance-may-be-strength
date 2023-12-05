# Allow run to connect to GDB by specifying GDB flags
# for example, -s -S
GDB = 
DEBUG_WITH_GDB = -s -S
LIB = ../target/aarch64-unknown-linux-gnu/release/libhomer_rust.rlib

all: kernel8.img

boot.o: boot.S
	aarch64-linux-gnu-gcc -Wall -O2 -ffreestanding -fno-stack-protector -nostdinc -nostdlib -nostartfiles -c boot.S -o boot.o

kernel8.img: boot.o $(LIB)
	aarch64-linux-gnu-ld -nostdlib boot.o $(LIB) -T linker.ld -o kernel8.elf
	aarch64-linux-gnu-objcopy -O binary kernel8.elf kernel8.img

clean:
	rm -f kernel8.elf kernel8.img *.o

run: kernel8.img
	qemu-system-aarch64 $(GDB) -M raspi3b -kernel kernel8.img -serial stdio
