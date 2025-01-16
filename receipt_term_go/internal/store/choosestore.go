package store

import (
	"math/rand/v2"
)

var stores []Store

func init() {
	ns := rand.IntN(12) + 6
	stores = make([]Store, ns)
	for i := 0; i < ns; i++ {
		stores[i] = makeStore()
	}
}

func AnyStore() Store {
	s := rand.IntN(len(stores))
	return stores[s]
}
