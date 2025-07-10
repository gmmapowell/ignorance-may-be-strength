package main

import (
	"context"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type Stock struct {
	Symbol string
	Price  int
}

type Inserter struct {
	svc *dynamodb.Client
}

func (ins *Inserter) Insert(table string, item any) error {
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

func NewInserter() *Inserter {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatal(err)
	}
	return &Inserter{svc: dynamodb.NewFromConfig(cfg)}
}

func main() {
	inserter := NewInserter()

	inserter.Insert("Stocks", Stock{
		Symbol: "HWX2",
		Price:  1195,
	})
}
