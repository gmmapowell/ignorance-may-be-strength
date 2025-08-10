package main

import (
	"fmt"
	"log"
	"os"
	"slices"

	"github.com/gmmapowell/ignorance/neptune/internal/neptune"
)

func main() {
	if len(os.Args) < 2 {
		log.Printf("Usage: watchers <stock>")
		return
	}
	stock := os.Args[1]
	svc, err := neptune.OpenNeptune("user-stocks")
	if err != nil {
		panic(err)
	}

	watchers, err := neptune.FindStockWatchers(svc, stock)
	if err != nil {
		panic(err)
	}
	if len(watchers) == 0 {
		fmt.Printf("no watchers found\n")
		return
	}
	slices.SortFunc(watchers, neptune.OrderConnection)
	curr := ""
	fmt.Printf("Stock %s watched by:\n", stock)
	for _, w := range watchers {
		if w.User != curr {
			fmt.Printf("  %s\n", w.User)
			curr = w.User
		}
		if w.ConnectionId != "" {
			fmt.Printf("    connected at %s\n", w.ConnectionId)
		}
	}
}
