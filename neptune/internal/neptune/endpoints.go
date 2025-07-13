package neptune

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/neptunedata"
)

func ConnectEndpoint(db string, watcher string, connId string) error {
	svc, err := openNeptune(db)
	if err != nil {
		return err
	}

	program := `
		MATCH (u:User {username:$username})
		CREATE (e:Endpoint {connId:$connId})
		CREATE (u)-[r:endpoint]->(e)
		RETURN e, r
`
	params := fmt.Sprintf(`{"username": "%s", "connId":"%s"}`, watcher, connId)
	linkQuery := neptunedata.ExecuteOpenCypherQueryInput{OpenCypherQuery: aws.String(program), Parameters: aws.String(params)}
	out, err := svc.ExecuteOpenCypherQuery(context.TODO(), &linkQuery)
	if err != nil {
		return err
	}

	ret, err := unpack(out.Results)
	if err != nil {
		return err
	}

	if len(ret) == 0 {
		return fmt.Errorf("no user found to connect: %s", watcher)
	}

	return nil
}

func DisconnectEndpoint(db string, connId string) error {
	svc, err := openNeptune(db)
	if err != nil {
		return err
	}

	program := `
		MATCH (e:Endpoint {connId:$connId})
		DETACH DELETE (e)
		RETURN e
`
	params := fmt.Sprintf(`{"connId":"%s"}`, connId)
	linkQuery := neptunedata.ExecuteOpenCypherQueryInput{OpenCypherQuery: aws.String(program), Parameters: aws.String(params)}
	out, err := svc.ExecuteOpenCypherQuery(context.TODO(), &linkQuery)
	if err != nil {
		return err
	}

	ret, err := unpack(out.Results)
	if err != nil {
		return err
	}

	if len(ret) == 0 {
		return fmt.Errorf("no connectionId found to disconnect: %s", connId)
	}

	return nil
}
