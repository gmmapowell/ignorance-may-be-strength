#!/bin/bash -e

if [ $# -lt 1 ] ; then
  echo "deploy <v#>" >&1
  exit 1
fi

VERSION="$1"

set -x
zip -ro /tmp/history.zip HTACCESS css js index.html
scp /tmp/history.zip gmmapowell@jshistory.gmmapowell.com:temp
ssh gmmapowell@jshistory.gmmapowell.com "bin/unpackHistory $VERSION"
