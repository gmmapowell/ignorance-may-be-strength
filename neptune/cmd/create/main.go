package main

import (
	"log"

	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
	"github.com/gmmapowell/ignorance/neptune/internal/neptune"
)

type Stock struct {
	Symbol string
	Price  int
}

func main() {
	inserter, err := dynamo.NewInserter()
	if err != nil {
		log.Fatal(err)
	}

	stock := Stock{
		Symbol: "HWX2",
		Price:  1195,
	}

	err = inserter.Insert("Stocks", stock)
	if err != nil {
		log.Fatal(err)
	}

	nodeCreator, err := neptune.NewNodeCreator("user-stocks")
	if err != nil {
		log.Fatal(err)
	}

	err = nodeCreator.Insert("Stock", stock.Symbol)
	if err != nil {
		log.Fatal(err)
	}
}
