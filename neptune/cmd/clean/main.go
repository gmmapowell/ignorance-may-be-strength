package main

import (
	"log"

	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
	"github.com/gmmapowell/ignorance/neptune/internal/neptune"
)

func main() {
	dc, err := dynamo.NewCleaner()
	if err != nil {
		log.Fatal(err)
	}
	dc.Clean("Stocks", "Symbol")

	nc, err := neptune.NewCleaner("user-stocks")
	if err != nil {
		log.Fatal(err)
	}
	nc.Clean()
}
