package neptune

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/neptunedata"
)

type NodeCreator struct {
	svc *neptunedata.Client
}

func (nc *NodeCreator) Insert(ty string, label string) error {
	create := "CREATE (n:" + ty + " {symbol: $symbol})"
	params := fmt.Sprintf(`{"symbol": "%s"}`, label)
	insertQuery := neptunedata.ExecuteOpenCypherQueryInput{OpenCypherQuery: aws.String(create), Parameters: aws.String(params)}
	out, err := nc.svc.ExecuteOpenCypherQuery(context.TODO(), &insertQuery)
	if err != nil {
		return err
	}
	var results []map[string]any = nil
	err = out.Results.UnmarshalSmithyDocument(&results)
	if err != nil {
		return err
	}
	for _, m := range results {
		for k, v := range m {
			log.Printf("result %s => %s\n", k, v)
		}
	}
	return err
}

func NewNodeCreator(db string) (*NodeCreator, error) {
	svc, err := openNeptune(db)
	if err != nil {
		return nil, err
	} else {
		return &NodeCreator{svc: svc}, nil
	}
}
