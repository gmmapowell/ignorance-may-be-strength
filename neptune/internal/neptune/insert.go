package neptune

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/neptunedata"
	"github.com/aws/aws-sdk-go-v2/service/neptunedata/document"
)

type NodeCreator struct {
	svc *neptunedata.Client
}

func (nc *NodeCreator) Insert(ty string, prop string, label string) error {
	create := fmt.Sprintf("CREATE (n:%s {%s: $%s})", ty, prop, prop)
	params := fmt.Sprintf(`{"%s": "%s"}`, prop, label)
	insertQuery := neptunedata.ExecuteOpenCypherQueryInput{OpenCypherQuery: aws.String(create), Parameters: aws.String(params)}
	out, err := nc.svc.ExecuteOpenCypherQuery(context.TODO(), &insertQuery)
	if err != nil {
		return err
	}
	return showResults(out.Results)
}

func (nc *NodeCreator) Link(rel string, t1, p1, l1 string, t2, p2, l2 string) error {
	program := `
MATCH (u:%s {%s: $%s}) 
MATCH (s:%s {%s: $%s})
CREATE (u)-[r:%s]->(s)
RETURN r
`
	doLink := fmt.Sprintf(program, t1, p1, p1, t2, p2, p2, rel)
	params := fmt.Sprintf(`{"%s": "%s","%s": "%s"}`, p1, l1, p2, l2)
	log.Printf("Query: %s Params: %s\n", doLink, params)
	linkQuery := neptunedata.ExecuteOpenCypherQueryInput{OpenCypherQuery: aws.String(doLink), Parameters: aws.String(params)}
	out, err := nc.svc.ExecuteOpenCypherQuery(context.TODO(), &linkQuery)
	if err != nil {
		return err
	}
	return showResults(out.Results)
}

func NewNodeCreator(db string) (*NodeCreator, error) {
	svc, err := openNeptune(db)
	if err != nil {
		return nil, err
	} else {
		return &NodeCreator{svc: svc}, nil
	}
}

func showResults(doc document.Interface) error {
	var results []map[string]any = nil
	err := doc.UnmarshalSmithyDocument(&results)
	if err != nil {
		return err
	}
	for _, m := range results {
		for k, v := range m {
			log.Printf("result %s => %s\n", k, v)
		}
	}
	return nil
}
