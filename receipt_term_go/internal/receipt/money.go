package receipt

import (
	"fmt"
	"math/rand/v2"
)

type Money int

func (m Money) String() string {
	pounds := m / 100
	pence := m % 100
	return fmt.Sprintf("£%d.%02d", pounds, pence)
}

func RandMoney() Money {
	return Money(rand.IntN(50) + rand.IntN(50) + rand.IntN(100))
}
