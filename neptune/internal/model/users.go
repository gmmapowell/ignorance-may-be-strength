package model

import (
	"fmt"
	"log"
	"math/rand/v2"

	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
	"github.com/gmmapowell/ignorance/neptune/internal/neptune"
)

func CreateInsertAndLinkUsers(inserter *dynamo.Inserter, creator *neptune.NodeCreator, stocks []*Stock, count int, from, to int) {
	r := rand.New(rand.NewPCG(1, 2))
	for i := 1; i <= count; i++ {
		name := fmt.Sprintf("user%03d", i)
		u := User{Username: name}
		log.Printf("User %s\n", u.Username)

		err := inserter.Insert("Users", u)
		if err != nil {
			log.Fatal(err)
		}

		err = creator.Insert("User", "username", u.Username)
		if err != nil {
			log.Fatal(err)
		}

		linkTo := make([]int, from+r.IntN(to-from+1))
		for j := 0; j < len(linkTo); j++ {
			linkTo[j] = uniqueStock(r, len(stocks), linkTo)
			sym := stocks[linkTo[j]].Symbol
			log.Printf("  watching %s\n", sym)
			err := creator.Link("Watching", "User", "username", u.Username, "Stock", "symbol", sym)
			if err != nil {
				log.Fatal(err)
			}
		}
	}
}

func uniqueStock(r *rand.Rand, quant int, notIn []int) int {
tryAgain:
	for {
		tryIt := r.IntN(quant)
		for _, s := range notIn {
			if s == tryIt {
				continue tryAgain
			}
		}
		return tryIt
	}
}
