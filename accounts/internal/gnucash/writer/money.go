package writer

import "fmt"

type Money struct {
	Units, Subunits int
}

func GBP(units int) Money {
	if units < 0 {
		panic("invalid money")
	}
	return Money{Units: units, Subunits: 0}
}

func GBPP(units, subunits int) Money {
	if units < 0 || subunits < 0 || subunits > 100 {
		panic("invalid money")
	}
	return Money{Units: units, Subunits: subunits}
}

func (m Money) GCCredit() string {
	return fmt.Sprintf("%d/100", 100*m.Units+m.Subunits)
}

func (m Money) GCDebit() string {
	return "-" + m.GCCredit()
}

func (m Money) String() string {
	return fmt.Sprintf("£%d.%02d", m.Units, m.Subunits)
}
