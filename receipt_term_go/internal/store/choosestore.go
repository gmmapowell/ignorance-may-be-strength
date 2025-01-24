package store

import (
	"fmt"
	"math/rand/v2"
)

var stores []Store

func init() {
	ns := rand.IntN(12) + 6
	stores = make([]Store, ns)
	for i := 0; i < ns; i++ {
		stores[i] = makeStore()
		fmt.Printf("store %d = %s\n", i, stores[i])
	}
}

func AnyStore() Store {
	s := rand.IntN(len(stores))
	return stores[s]
}
