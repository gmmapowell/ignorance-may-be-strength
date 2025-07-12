package neptune

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/neptunedata"
)

type Cleaner struct {
	svc *neptunedata.Client
}

func (c *Cleaner) Clean() error {
	clean := `	MATCH (n)
				DETACH DELETE n`
	cleanQuery := neptunedata.ExecuteOpenCypherQueryInput{OpenCypherQuery: aws.String(clean)}
	_, err := c.svc.ExecuteOpenCypherQuery(context.TODO(), &cleanQuery)
	return err
}

func NewCleaner(db string) (*Cleaner, error) {
	svc, err := openNeptune(db)
	if err != nil {
		return nil, err
	} else {
		return &Cleaner{svc: svc}, nil
	}
}
