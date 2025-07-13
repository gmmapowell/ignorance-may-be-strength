package neptune

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/neptunedata"
)

func FindWatchedStocks(db string, user string) ([]string, error) {
	svc, err := openNeptune(db)
	if err != nil {
		return nil, err
	}
	query := `
	MATCH (u:User {username:$username})-[r]->(s:Stock)
	RETURN u.username, s.symbol
	`
	params := fmt.Sprintf(`{"username": "%s"}`, user)
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
		ret = append(ret, m["s.symbol"].(string))
	}

	return ret, nil
}
