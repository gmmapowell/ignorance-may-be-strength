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

func (m *Money) Incorporate(effect int, other Money) {
	m.Units += effect * other.Units
	m.Subunits += effect * other.Subunits
	m.Normalize()
}

func (m *Money) Normalize() {
	for m.Subunits < 0 {
		m.Subunits += 100
		m.Units -= 1
	}
	for m.Subunits >= 100 {
		m.Subunits -= 100
		m.Units += 1
	}
}

func (m Money) IsNonZero() bool {
	return m.Units != 0 || m.Subunits != 0
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
