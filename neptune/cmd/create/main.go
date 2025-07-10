package main

import (
	"log"

	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
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
	
	inserter.Insert("Stocks", Stock{
		Symbol: "HWX2",
		Price:  1195,
	})
}
