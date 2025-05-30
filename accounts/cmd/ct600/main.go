package main

import (
	"fmt"
	"os"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/submission"
)

func main() {
	conf := config.MakeBlankConfig()
	for _, f := range os.Args[1:] {
		err := config.IncludeConfig(conf, f)
		if err != nil {
			fmt.Printf("failed to read config %s: %v\n", f, err)
			return
		}
	}
	err := submission.Submit(conf)
	if err != nil {
		fmt.Printf("submission failed: %v\n", err)
		return
	}
}
