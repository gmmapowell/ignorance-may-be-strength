package neptune

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/neptune"
	"github.com/aws/aws-sdk-go-v2/service/neptunedata"
)

func openNeptune(db string) (*neptunedata.Client, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, err
	}
	nc := neptune.NewFromConfig(cfg)
	endpoints, err := nc.DescribeDBClusterEndpoints(context.TODO(), &neptune.DescribeDBClusterEndpointsInput{DBClusterIdentifier: aws.String(db)})
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
