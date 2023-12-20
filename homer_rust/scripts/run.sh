set -e

`dirname $0`/build.sh
cd asm
make run
