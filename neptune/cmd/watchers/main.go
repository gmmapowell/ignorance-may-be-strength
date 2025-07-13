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
	watchers, err := neptune.FindStockWatchers("user-stocks", stock)
	if err != nil {
		panic(err)
	}
	if len(watchers) == 0 {
		fmt.Printf("no watchers found\n")
		return
	}
	slices.Sort(watchers)
	fmt.Printf("Stock %s watched by:\n", stock)
	for _, w := range watchers {
		fmt.Printf("  %s\n", w)
	}
}
