#!/bin/sh

. scripts/checkvars.sh

aws cloudformation delete-stack --stack-name 'ignorant-gateway'
while aws cloudformation list-stacks | jq -r '.StackSummaries[] | if .StackStatus != "DELETE_COMPLETE" then .StackName + ": " + .StackStatus else "" end' | grep -s 'ignorant-gateway' ; do
	sleep 1
done