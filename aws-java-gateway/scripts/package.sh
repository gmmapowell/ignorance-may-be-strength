#!/bin/bash

. scripts/checkvars.sh

# Ensure that the directories we are going to use are available
mkdir -p compilelibs libs build upload

# First time through, download the AWS libraries we depend on
if [ ! -f compilelibs/aws-lambda-core-1.2.0.jar ] ; then
  curl -o compilelibs/aws-lambda-core-1.2.0.jar http://repo1.maven.org/maven2/com/amazonaws/aws-lambda-java-core/1.2.0/aws-lambda-java-core-1.2.0.jar
fi

if [ ! -f compilelibs/aws-lambda-events-2.2.7.jar ] ; then
  curl -o compilelibs/aws-lambda-events-2.2.7.jar http://repo1.maven.org/maven2/com/amazonaws/aws-lambda-java-events/2.2.7/aws-lambda-java-events-2.2.7.jar
fi

# Use javac to compile all our code to build
javac -cp compilelibs/*:libs/* -d build -sourcepath src/main/java `find src/main/java -name '*.java'`

# Create an uploadable jar of our blog files
jar cf upload/code.jar -C build blog

# Upload it to the bucket
aws s3 cp upload/code.jar s3://$BUCKET/lambda1.zip

# Now we need to tell the lambda we have updated it
# First obtain the lambda name from the stack
lambdaName="`aws cloudformation list-stack-resources --stack-name ignorant-gateway | jq -r '.StackResourceSummaries[] | .LogicalResourceId + ": " + .PhysicalResourceId' | sed -ne 's/Lambda1: //p'`"

# Then tell it where the code is
aws lambda update-function-code --function "$lambdaName" --s3-bucket "$BUCKET" --s3-key lambda1.zip | jq -r .LastUpdateStatus