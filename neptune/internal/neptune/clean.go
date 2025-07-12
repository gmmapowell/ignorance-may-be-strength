package neptune

import "github.com/aws/aws-sdk-go-v2/service/neptunedata"

type Cleaner struct {
	svc *neptunedata.Client
}

func (c *Cleaner) Clean() error {
	return nil
}

func NewCleaner(db string) (*Cleaner, error) {
	svc, err := openNeptune(db)
	if err != nil {
		return nil, err
	} else {
		return &Cleaner{svc: svc}, nil
	}
}
