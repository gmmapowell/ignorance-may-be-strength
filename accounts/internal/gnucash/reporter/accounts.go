package reporter

import (
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/writer"
)

type account interface {
	Credit(date writer.DateInfo, amount writer.Money)
	Debit(date writer.DateInfo, amount writer.Money)
	HasBalance() bool
	Balance() writer.Money
	IsPL() bool
	PLEffect() int
}

type actor struct {
	debitEffect, creditEffect int
	justYear                  bool
	year                      int
	balance                   writer.Money
}

func (a *actor) Credit(date writer.DateInfo, amount writer.Money) {
	if a.justYear && date.Year != a.year {
		return
	}
	if date.Year > a.year {
		return
	}
	a.balance.Incorporate(a.creditEffect, amount)
	// fmt.Printf("Collect credit %s => %s\n", amount, a.balance)
}

func (a *actor) Debit(date writer.DateInfo, amount writer.Money) {
	if a.justYear && date.Year != a.year {
		return
	}
	if date.Year > a.year {
		return
	}
	a.balance.Incorporate(a.debitEffect, amount)
	// fmt.Printf("Collect debit %s => %s\n", amount, a.balance)
}

func (a *actor) HasBalance() bool {
	return a.balance.IsNonZero()
}

func (a *actor) IsPL() bool {
	return a.justYear
}

func (a *actor) Balance() writer.Money {
	return a.balance
}

func (a *actor) PLEffect() int {
	return -a.creditEffect
}

func makeAccount(yr int, ty string) account {
	switch ty {
	case "ASSET":
		fallthrough
	case "BANK":
		return &actor{debitEffect: -1, creditEffect: 1, justYear: false, year: yr}
	case "EXPENSE":
		return &actor{debitEffect: -1, creditEffect: 1, justYear: true, year: yr}
	case "INCOME":
		return &actor{debitEffect: 1, creditEffect: -1, justYear: true, year: yr}
	case "EQUITY":
		return &actor{debitEffect: 1, creditEffect: -1, justYear: false, year: yr}
	case "LIABILITY":
		return &actor{debitEffect: 1, creditEffect: -1, justYear: false, year: yr}
	default:
		panic("no such account type: " + ty)
	}
}
