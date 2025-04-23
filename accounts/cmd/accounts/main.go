package main

import (
	"fmt"
	"os"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
)

func main() {
	_, err := config.ReadConfig(os.Args[1])
	if err != nil {
		fmt.Printf("failed to read config: %v\n", err)
	}
}
