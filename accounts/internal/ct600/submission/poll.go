package submission

import (
	"log"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/govtalk"
)

func Poll(conf *config.Config) error {
	pollOptions := &govtalk.EnvelopeOptions{Qualifier: "poll", Function: "submit", SendCorrelationID: true, CorrelationID: conf.CorrelationID, IncludeSender: false}
	send, err := Generate("", false, conf, pollOptions)
	if err != nil {
		return err
	}

	msg, err := transmitTo(conf.PollURI, send)
	if err != nil {
		return err
	}

	log.Printf("%s\n", string(msg))
	return nil
}
