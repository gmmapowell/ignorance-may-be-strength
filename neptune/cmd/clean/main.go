package main

import (
	"log"

	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
	"github.com/gmmapowell/ignorance/neptune/internal/neptune"
)

func main() {
	log.Printf("Cleaning dynamo")
	svc, err := dynamo.OpenDynamo()
	if err != nil {
		panic(err)
	}
	dc, err := dynamo.NewCleaner(svc)
	if err != nil {
		log.Fatal(err)
	}
	dc.Clean("Stocks", "Symbol")

	log.Printf("Cleaning neptune")
	db, err := neptune.OpenNeptune("user-stocks")
	if err != nil {
		log.Fatal(err)
	}
	nc, err := neptune.NewCleaner(db)
	if err != nil {
		log.Fatal(err)
	}
	nc.Clean()

	log.Printf("Cleaning complete")
}
