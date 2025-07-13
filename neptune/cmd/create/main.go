package main

import (
	"log"

	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
	"github.com/gmmapowell/ignorance/neptune/internal/model"
	"github.com/gmmapowell/ignorance/neptune/internal/neptune"
)

func main() {
	inserter, err := dynamo.NewInserter()
	if err != nil {
		log.Fatal(err)
	}

	nodeCreator, err := neptune.NewNodeCreator("user-stocks")
	if err != nil {
		log.Fatal(err)
	}

	stocks := model.CreateAndInsertStocks(inserter, nodeCreator, 2000)
	model.CreateInsertAndLinkUsers(inserter, nodeCreator, stocks, 100, 10, 30)
}
