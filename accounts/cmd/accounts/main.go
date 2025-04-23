package main

import (
	"fmt"
	"os"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/pipeline"
)

func main() {
	conf, err := config.ReadConfig(os.Args[1])
	if err == nil {
		pipeline.AccountsPipeline(conf)
	} else {
		fmt.Printf("failed to read config: %v\n", err)
	}
}
