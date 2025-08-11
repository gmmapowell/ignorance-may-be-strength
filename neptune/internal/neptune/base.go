package neptune

import (
	"context"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/neptunedata"
)

func OpenNeptune(db string) (*neptunedata.Client, error) {
	log.Printf("loading config")
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, err
	}
	/* this does not work from within a VPC because of IPv4 issues and IPv6 is not supported
		log.Printf("new from config")
		nc := neptune.NewFromConfig(cfg)
		log.Printf("describe endpoints")
			endpoints, err := nc.DescribeDBClusterEndpoints(context.TODO(), &neptune.DescribeDBClusterEndpointsInput{DBClusterIdentifier: aws.String(db)})
			if err != nil {
				return nil, err
			}
			if len(endpoints.DBClusterEndpoints) < 1 {
				return nil, fmt.Errorf("no cluster endpoints found")
			}
			endpoint := *endpoints.DBClusterEndpoints[0].Endpoint
	*/
	endpoint := "user-stocks.cluster-ckgvna81hufy.us-east-1.neptune.amazonaws.com"
	log.Printf("creating client")
	cli := neptunedata.NewFromConfig(cfg, func(opts *neptunedata.Options) {
		opts.BaseEndpoint = aws.String("https://" + endpoint + ":8182/")
	})
	log.Printf("returning client %p", cli)
	return cli, nil
}
