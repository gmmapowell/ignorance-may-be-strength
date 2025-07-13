package neptune

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/neptunedata"
)

func FindStockWatchers(db string, stock string) ([]string, error) {
	svc, err := openNeptune(db)
	if err != nil {
		return nil, err
	}
	query := `
	MATCH (u:User)-[r]->(s:Stock {symbol:$symbol})
	RETURN u.username, s.symbol
	`
	params := fmt.Sprintf(`{"symbol": "%s"}`, stock)
	linkQuery := neptunedata.ExecuteOpenCypherQueryInput{OpenCypherQuery: aws.String(query), Parameters: aws.String(params)}
	out, err := svc.ExecuteOpenCypherQuery(context.TODO(), &linkQuery)
	if err != nil {
		return nil, err
	}

	results, err := unpack(out.Results)
	if err != nil {
		return nil, err
	}
	var ret []string
	for _, m := range results {
		ret = append(ret, m["u.username"].(string))
	}

	return ret, nil
}
