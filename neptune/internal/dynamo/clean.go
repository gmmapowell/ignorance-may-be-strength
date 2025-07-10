package dynamo

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type Cleaner struct {
	svc *dynamodb.Client
}

func (c *Cleaner) Clean(table string, keys ...string) error {
	for {
		scanner := dynamodb.ScanInput{TableName: &table}
		result, err := c.svc.Scan(context.TODO(), &scanner)
		if err != nil {
			return err
		}
		for _, it := range result.Items {
			key := make(map[string]types.AttributeValue)
			for _, k := range keys {
				key[k] = it[k]
			}
			di := dynamodb.DeleteItemInput{TableName: &table, Key: key}
			_, err = c.svc.DeleteItem(context.TODO(), &di)
			if err != nil {
				return err
			}
		}
		if result.LastEvaluatedKey == nil {
			break
		}
	}
	return nil
}

func NewCleaner() (*Cleaner, error) {
	svc, err := openDynamo()
	if err != nil {
		return nil, err
	} else {
		return &Cleaner{svc: svc}, nil
	}
}
