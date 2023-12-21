set -e

`dirname $0`/build.sh --release
cd asm
make run
