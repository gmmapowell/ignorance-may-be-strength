package config

import "github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"

type Config struct {
	config.Configuration
	Sender, Password         string
	Utr                      string
	Vendor, Product, Version string
}

func MakeBlankConfig() *Config {
	ret := Config{Configuration: config.MakeConfiguration()}
	return &ret
}

func IncludeConfig(conf *Config, file string) error {
	err := config.ReadAConfiguration(conf, file)
	return err
}
