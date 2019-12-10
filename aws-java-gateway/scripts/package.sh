#!/bin/bash

. scripts/checkvars.sh

# Ensure that the directories we are going to use are available
mkdir -p compilelibs libs build upload

# First time through, download the AWS libraries we depend on

if [ ! -f lib/aws-java-sdk-core-1.11.688.jar ] ; then
  curl -o lib/aws-java-sdk-core-1.11.688.jar http://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-core/1.11.688/aws-java-sdk-core-1.11.688.jar
fi

if [ ! -f compilelibs/aws-lambda-core-1.2.0.jar ] ; then
  curl -o compilelibs/aws-lambda-core-1.2.0.jar http://repo1.maven.org/maven2/com/amazonaws/aws-lambda-java-core/1.2.0/aws-lambda-java-core-1.2.0.jar
fi

if [ ! -f compilelibs/aws-lambda-events-2.2.7.jar ] ; then
  curl -o compilelibs/aws-lambda-events-2.2.7.jar http://repo1.maven.org/maven2/com/amazonaws/aws-lambda-java-events/2.2.7/aws-lambda-java-events-2.2.7.jar
fi

if [ ! -f lib/aws-java-sdk-apigatewaymanagementapi-1.11.688.jar ] ; then
  curl -o lib/aws-java-sdk-apigatewaymanagementapi-1.11.688.jar http://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-apigatewaymanagementapi/1.11.688/aws-java-sdk-apigatewaymanagementapi-1.11.688.jar
fi

if [ ! -f compilelibs/grizzly-websockets-server-2.4.3.jar ] ; then
  curl -o compilelibs/grizzly-websockets-server-2.4.3.jar http://repo1.maven.org/maven2/org/glassfish/grizzly/grizzly-websockets-server/2.4.3/grizzly-websockets-server-2.4.3.jar
fi

if [ ! -f lib/httpclient-4.5.9.jar ] ; then
  curl -o lib/httpclient-4.5.9.jar http://repo1.maven.org/maven2/org/apache/httpcomponents/httpclient/4.5.9/httpclient-4.5.9.jar
fi

if [ ! -f lib/httpcore-4.4.11.jar ] ; then
  curl -o lib/httpcore-4.4.11.jar http://repo1.maven.org/maven2/org/apache/httpcomponents/httpcore/4.4.11/httpcore-4.4.11.jar
fi

if [ ! -f lib/commons-codec-1.11.jar ] ; then
  curl -o lib/commons-codec-1.11.jar http://repo1.maven.org/maven2/commons-codec/commons-codec/1.11/commons-codec-1.11.jar
fi

if [ ! -f lib/jackson-databind-2.6.7.3.jar ] ; then
  curl -o lib/jackson-databind-2.6.7.3.jar http://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.6.7.3/jackson-databind-2.6.7.3.jar
fi

if [ ! -f lib/jackson-annotations-2.6.0.jar ] ; then
  curl -o lib/jackson-annotations-2.6.0.jar http://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.6.0/jackson-annotations-2.6.0.jar
fi

if [ ! -f lib/jackson-core-2.6.7.jar ] ; then
  curl -o lib/jackson-core-2.6.7.jar http://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.6.7/jackson-core-2.6.7.jar
fi

if [ ! -f lib/jackson-dataformat-cbor-2.6.7.jar ] ; then
  curl -o lib/jackson-dataformat-cbor-2.6.7.jar http://repo1.maven.org/maven2/com/fasterxml/jackson/dataformat/jackson-dataformat-cbor/2.6.7/jackson-dataformat-cbor-2.6.7.jar
fi

if [ ! -f lib/commons-logging-1.1.3.jar ] ; then
  curl -o lib/commons-logging-1.1.3.jar http://repo1.maven.org/maven2/commons-logging/commons-logging/1.1.3/commons-logging-1.1.3.jar
fi

if [ ! -f lib/joda-time-2.8.1.jar ] ; then
  curl -o lib/joda-time-2.8.1.jar http://repo1.maven.org/maven2/joda-time/joda-time/2.8.1/joda-time-2.8.1.jar
fi

if [ ! -f lib/ion-java-1.0.2.jar ] ; then
  curl -o lib/ion-java-1.0.2.jar http://repo1.maven.org/maven2/software/amazon/ion/ion-java/1.0.2/ion-java-1.0.2.jar
fi

if [ ! -f  lib/java-client-2.7.11.jar ] ; then
  curl -o lib/java-client-2.7.11.jar http://repo1.maven.org/maven2/com/couchbase/client/java-client/2.7.11/java-client-2.7.11.jar
fi

if [ ! -f lib/core-io-1.7.11.jar ] ; then
  curl -o lib/core-io-1.7.11.jar http://repo1.maven.org/maven2/com/couchbase/client/core-io/1.7.11/core-io-1.7.11.jar
fi

if [ ! -f lib/rxjava-1.3.8.jar ] ; then
  curl -o lib/rxjava-1.3.8.jar http://repo1.maven.org/maven2/io/reactivex/rxjava/1.3.8/rxjava-1.3.8.jar
fi

if [ ! -f lib/opentracing-api-0.31.0.jar ] ; then
  curl -o lib/opentracing-api-0.31.0.jar http://repo1.maven.org/maven2/io/opentracing/opentracing-api/0.31.0/opentracing-api-0.31.0.jar
fi

# Use javac to compile all our code to build
javac -cp compilelibs/*:lib/* -d build -sourcepath src/main/java `find src/main/java -name '*.java'`
if [ $? -ne 0 ] ; then
  exit 1
fi

# Create an uploadable jar of our blog files
jar cf upload/code.jar -C build blog lib

# Upload it to the bucket
aws s3 cp upload/code.jar s3://$BUCKET/lambda1.zip

# Now we need to tell the lambda we have updated it
# First obtain the lambda name from the stack
lambdaName="`aws cloudformation list-stack-resources --stack-name ignorant-gateway | jq -r '.StackResourceSummaries[] | .LogicalResourceId + ": " + .PhysicalResourceId' | sed -ne 's/Lambda1: //p'`"

# Then tell it where the code is
aws lambda update-function-code --function "$lambdaName" --s3-bucket "$BUCKET" --s3-key lambda1.zip | jq -r .LastUpdateStatus
