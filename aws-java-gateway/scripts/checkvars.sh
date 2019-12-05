ERR=0
if [ -z "$REGION" ] ; then
  echo "The REGION variable must be set" >&2
  ERR=1
fi
if [ -z "$BUCKET" ] ; then
  echo "The BUCKET variable must be set" >&2
  ERR=1
fi
if [ "$ERR" = 1 ] ; then
  exit $ERR
fi