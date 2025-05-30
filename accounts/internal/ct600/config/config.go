package config

import "github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"

type Config struct {
	config.Configuration
	Sender, Password         string
	Utr                      string
	Vendor, Product, Version string
}

func ReadConfig(file string) (*Config, error) {
	ret := Config{Configuration: config.Configuration{VerbMap: make(map[string]*config.Verb)}}
	err := config.ReadAConfiguration(&ret, file)
	if err != nil {
		return nil, err
	} else {
		return &ret, nil
	}
}
