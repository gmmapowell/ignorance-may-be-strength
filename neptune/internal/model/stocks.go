package model

import (
	"log"
	"math/rand/v2"

	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
	"github.com/gmmapowell/ignorance/neptune/internal/neptune"
)

func CreateAndInsertStocks(inserter *dynamo.Inserter, creator *neptune.NodeCreator, count int) []*Stock {
	// We could very easily generate randomly random data
	// But I quite like having reproducability
	r := rand.New(rand.NewPCG(1, 2))
	stocks := make([]*Stock, count)
	for i := 0; i < count; i++ {
		name := uniqueName(r, stocks[0:i])
		s := Stock{Symbol: name, Price: somePrice(r, 100, 500)}
		stocks[i] = &s
		log.Printf("stock %s %d\n", s.Symbol, s.Price)

		err := inserter.Insert("Stocks", s)
		if err != nil {
			log.Fatal(err)
		}

		err = creator.Insert("Stock", "symbol", s.Symbol)
		if err != nil {
			log.Fatal(err)
		}

	}
	return stocks
}

func uniqueName(r *rand.Rand, notIn []*Stock) string {
tryAgain:
	for {
		tryIt := someName(r)
		for _, s := range notIn {
			if s.Symbol == tryIt {
				continue tryAgain
			}
		}
		return tryIt
	}
}

func someName(r *rand.Rand) string {
	name := make([]rune, 4)
	for i := 0; i < 3; i++ {
		name[i] = rune(65 + r.IntN(26))
	}
	if r.IntN(2) == 0 {
		name[3] = rune(65 + r.IntN(26))

	} else {
		name[3] = rune(48 + r.IntN(10))
	}
	return string(name)
}

func somePrice(r *rand.Rand, from, to int) int {
	return from + r.IntN(to-from+1)
}
