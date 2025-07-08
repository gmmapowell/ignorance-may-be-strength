package submission

import (
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/govtalk"
)

func List(conf *config.Config) error {
	pollOptions := &govtalk.EnvelopeOptions{Qualifier: "request", Function: "list", SendCorrelationID: true, IncludeSender: true}
	send, err := Generate(conf, pollOptions)
	if err != nil {
		return err
	}

	return transmit(send)
}
