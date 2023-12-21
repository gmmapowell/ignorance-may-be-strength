set -e

`dirname $0`/build.sh
cd asm
make "GDB=-s -S" "VERSION=debug" run
