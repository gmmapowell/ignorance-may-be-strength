#!/bin/sh

. scripts/checkvars.sh

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

# create a temporary ZIP file (that won't work) because it has to be there for the deployment to succeed
rm foo.zip
jar cf foo.zip scripts/
aws s3 cp foo.zip s3://$BUCKET/lambda1.zip

# Start the stack creation
aws cloudformation create-stack \
  --stack-name 'ignorant-gateway' \
  --capabilities CAPABILITY_IAM \
  --parameters \
    "ParameterKey=BUCKET,ParameterValue=$BUCKET" \
    "ParameterKey=COUCHBASE,ParameterValue=$COUCHBASE" \
    "ParameterKey=CBUSER,ParameterValue=$CBUSER" \
    "ParameterKey=CBPASSWD,ParameterValue=$CBPASSWD" \
    "ParameterKey=CBBUCKET,ParameterValue=$CBBUCKET" \
  --template-body "`cat src/main/resources/gateway-cf.json`"
if [ $? -ne 0 ] ; then
  exit 1
fi

# Wait for stack completion to complete.  Note if it gets into a "ROLLBACK" status or some such you'll need to ^C it otherwise it will loop for ever
while aws cloudformation list-stacks | jq -r '.StackSummaries[] | if .StackStatus != "CREATE_COMPLETE" and .StackStatus != "ROLLBACK_COMPLETE" then .StackName + ": " + .StackStatus else "" end' | grep -v 'DELETE_COMPLETE' | grep -s ignorant ; do
  sleep 1
done

# List the resources we created and print out the resource address
aws cloudformation list-stack-resources --stack-name ignorant-gateway | jq -r '.StackResourceSummaries[] | .LogicalResourceId + ": " + .PhysicalResourceId'
addr=`aws cloudformation list-stack-resources --stack-name ignorant-gateway | jq -r '.StackResourceSummaries[] | .LogicalResourceId + ": " + .PhysicalResourceId' | sed -ne '/SimpleGateway/s/.*: //p'`
wsaddr=`aws cloudformation list-stack-resources --stack-name ignorant-gateway | jq -r '.StackResourceSummaries[] | .LogicalResourceId + ": " + .PhysicalResourceId' | sed -ne '/CounterGateway/s/.*: //p'`
echo "Gateway resource can be found at: https://$addr.execute-api.$REGION.amazonaws.com/ignorance/hello"
echo "Counter resource can be found at: https://$wsaddr.execute-api.$REGION.amazonaws.com/wscli"
exit 0
