package config

import (
	"fmt"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
)

type Config struct {
	config.Configuration
	Sender, Password         string
	Utr                      string
	Vendor, Product, Version string

	// Arguments for Polling
	PollURI, CorrelationID string
}

func MakeBlankConfig() *Config {
	ret := Config{Configuration: config.MakeConfiguration()}
	return &ret
}

func IncludeConfig(conf *Config, file string) error {
	err := config.ReadAConfiguration(conf, file)
	return err
}

func PollParameter(conf *Config, arg string) error {
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
