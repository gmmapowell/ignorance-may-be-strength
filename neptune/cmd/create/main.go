package main

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/neptune"
	"github.com/aws/aws-sdk-go-v2/service/neptunedata"
	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
)

type Stock struct {
	Symbol string
	Price  int
}

func main() {
	inserter, err := dynamo.NewInserter()
	if err != nil {
		log.Fatal(err)
	}

	err = inserter.Insert("Stocks", Stock{
		Symbol: "HWX2",
		Price:  1195,
	})
	if err != nil {
		log.Fatal(err)
	}

	nodeCreator, err := NewNodeCreator()
	if err != nil {
		log.Fatal(err)
	}

	err = nodeCreator.Insert("HWX2")
	if err != nil {
		log.Fatal(err)
	}
}

type NodeCreator struct {
	svc *neptunedata.Client
}

func (nc *NodeCreator) Insert(label string) error {
	create := "CREATE (a:stock) {Symbol: $symbol}"
	params := fmt.Sprintf(`{"name": "%s"}`, label)
	insertQuery := neptunedata.ExecuteOpenCypherQueryInput{OpenCypherQuery: aws.String(create), Parameters: aws.String(params)}
	_, err := nc.svc.ExecuteOpenCypherQuery(context.TODO(), &insertQuery)
	return err
}

func NewNodeCreator() (*NodeCreator, error) {
	svc, err := openNeptune()
	if err != nil {
		return nil, err
	} else {
		return &NodeCreator{svc: svc}, nil
	}
}

func openNeptune() (*neptunedata.Client, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, err
	}
	nc := neptune.NewFromConfig(cfg)
	endpoints, err := nc.DescribeDBClusterEndpoints(context.TODO(), &neptune.DescribeDBClusterEndpointsInput{DBClusterIdentifier: aws.String("user-stocks")})
	if err != nil {
		return nil, err
	}
	if len(endpoints.DBClusterEndpoints) < 1 {
		return nil, fmt.Errorf("no cluster endpoints found")
	}
	endpoint := *endpoints.DBClusterEndpoints[0].Endpoint
	cli := neptunedata.NewFromConfig(cfg, func(opts *neptunedata.Options) {
		opts.BaseEndpoint = aws.String("https://" + endpoint + ":8182/")
	})
	return cli, nil
}
