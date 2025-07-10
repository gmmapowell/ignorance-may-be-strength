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

func main() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatal(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	tableName := "Stocks"

	stock := Stock{
		Symbol: "HWX2",
		Price:  1195,
	}

	av, err := attributevalue.MarshalMap(stock)
	if err != nil {
		log.Fatalf("Got error marshalling new movie item: %s", err)
	}
	input := &dynamodb.PutItemInput{
		Item:      av,
		TableName: aws.String(tableName),
	}

	_, err = svc.PutItem(context.TODO(), input)
	if err != nil {
		log.Fatalf("Got error calling PutItem: %s", err)
	}
}
