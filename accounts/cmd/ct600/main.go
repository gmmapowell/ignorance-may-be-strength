package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/submission"
)

func main() {
	conf, mode, err := config.ParseArguments(os.Args[1:])
	if err != nil {
		fmt.Printf("error parsing arguments: %v\n", err)
		return
	}
	switch mode {
	case config.SUBMIT_MODE:
		err := submission.Submit(conf)
		if err != nil {
			fmt.Printf("submission failed: %v\n", err)
			return
		}
	case config.LIST_MODE:
		err := submission.List(conf)
		if err != nil {
			fmt.Printf("listing failed: %v\n", err)
			return
		}
	case config.POLL_MODE:
		err := submission.Poll(conf)
		if err != nil {
			fmt.Printf("polling failed: %v\n", err)
			return
		}
	default:
		log.Fatalf("there is no handler for mode %s\n", mode)
	}
}
