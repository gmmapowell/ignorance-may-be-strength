package main

import (
	"fmt"
	"log"
	"os"
	"slices"

	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
	"github.com/gmmapowell/ignorance/neptune/internal/neptune"
)

func main() {
	if len(os.Args) < 2 {
		log.Printf("Usage: stockprices <user>")
		return
	}
	user := os.Args[1]
	stocks, err := neptune.FindWatchedStocks("user-stocks", user)
	if err != nil {
		panic(err)
	}
	if len(stocks) == 0 {
		fmt.Printf("no stocks found\n")
		return
	}
	slices.Sort(stocks)
	prices, err := dynamo.FindStockPrices("Stocks", stocks)
	if err != nil {
		panic(err)
	}
	for _, s := range stocks {
		fmt.Printf("%s: %d\n", s, prices[s])
	}
}
