package main

import (
	"log"

	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
)

func main() {
	c, err := dynamo.NewCleaner()
	if err != nil {
		log.Fatal(err)
	}
	c.Clean("Stocks", "Symbol")
}
