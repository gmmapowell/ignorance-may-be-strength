set -e

RELEASE=""
VERSION="debug"

case "$1" in 
  --release)
    RELEASE="$1"
    VERSION="release"
    ;;
esac

cargo build $RELEASE --target aarch64-unknown-linux-gnu
cd asm
make "VERSION=$VERSION"
