set -e

cargo build --release --target aarch64-unknown-linux-gnu
cd asm
make
