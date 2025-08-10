package dynamo

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type Updater struct {
	svc *dynamodb.Client
}

func (ins *Updater) Update(table string, item any) error {
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		return err
	}

	input := &dynamodb.PutItemInput{
		Item:      av,
		TableName: aws.String(table),
	}

	_, err = ins.svc.PutItem(context.TODO(), input)
	return err
}

func NewUpdater(svc *dynamodb.Client) (*Updater, error) {
	return &Updater{svc: svc}, nil
}
