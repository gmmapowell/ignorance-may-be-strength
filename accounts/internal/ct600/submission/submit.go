package submission

import (
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/govtalk"
)

func Submit(conf *config.Config) error {
	submitOptions := &govtalk.EnvelopeOptions{Qualifier: "request", Function: "submit", IncludeSender: true, IncludeKeys: true, IncludeBody: true}
	send, err := Generate(conf, submitOptions)
	if err != nil {
		return err
	}

	_, err = transmit(send)
	return err
}
