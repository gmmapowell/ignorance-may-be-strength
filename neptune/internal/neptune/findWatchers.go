package neptune

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/neptunedata"
)

func FindStockWatchers(db string, stock string) ([]*Connection, error) {
	svc, err := openNeptune(db)
	if err != nil {
		return nil, err
	}
	query := `
	MATCH (u:User)-[r]->(s:Stock {symbol:$symbol})
	MATCH (u)-[]->(e:Endpoint)
	RETURN u.username, s.symbol, e.connId
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
	var ret []*Connection
	for _, m := range results {
		ret = append(ret, &Connection{User: m["u.username"].(string), ConnectionId: m["e.connId"].(string)})
	}

	return ret, nil
}
