package main

import (
	"log"

	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
	"github.com/gmmapowell/ignorance/neptune/internal/neptune"
)

func main() {
	log.Printf("Cleaning dynamo")
	dc, err := dynamo.NewCleaner()
	if err != nil {
		log.Fatal(err)
	}
	dc.Clean("Stocks", "Symbol")

	log.Printf("Cleaning neptune")
	nc, err := neptune.NewCleaner("user-stocks")
	if err != nil {
		log.Fatal(err)
	}
	nc.Clean()

	log.Printf("Cleaning complete")
}
