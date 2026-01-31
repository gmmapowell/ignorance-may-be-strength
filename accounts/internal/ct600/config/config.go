package config

import (
	"fmt"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
)

func PollParameter(conf *config.Configuration, arg string) error {
	if conf.PollURI == "" {
		conf.PollURI = arg
		return nil
	} else if conf.CorrelationID == "" {
		conf.CorrelationID = arg
		return nil
	} else {
		return fmt.Errorf("usage: --poll <uri> <correlation-id>")
	}
}
