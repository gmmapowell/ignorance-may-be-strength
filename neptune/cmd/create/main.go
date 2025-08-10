package main

import (
	"log"

	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
	"github.com/gmmapowell/ignorance/neptune/internal/model"
	"github.com/gmmapowell/ignorance/neptune/internal/neptune"
)

func main() {
	dyn, err := dynamo.OpenDynamo()
	if err != nil {
		panic(err)
	}

	inserter, err := dynamo.NewInserter(dyn)
	if err != nil {
		log.Fatal(err)
	}

	svc, err := neptune.OpenNeptune("user-stocks")
	if err != nil {
		panic(err)
	}

	nodeCreator, err := neptune.NewNodeCreator(svc)
	if err != nil {
		log.Fatal(err)
	}

	stocks := model.CreateAndInsertStocks(inserter, nodeCreator, 2000)
	model.CreateInsertAndLinkUsers(inserter, nodeCreator, stocks, 100, 10, 30)
}
