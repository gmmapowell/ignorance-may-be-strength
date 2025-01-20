package store

import (
	"fmt"
	"math/rand/v2"

	"github.com/gmmapowell/ignorance/receipt_term/internal/receipt"
)

type BasicStore struct {
	name string
	mid  string
}

// MakePurchase implements Store.
func (b *BasicStore) MakePurchase() *receipt.Receipt {
	headers := []string{fmt.Sprintf("Welcome to %s", b.name)}
	preface := []receipt.Preface{{Title: "Name", Value: b.name}, {Title: "MID", Value: b.mid}}
	items := createLineItems()
	totals, grandTotal := figureTotals(items)
	payments := makePayment(grandTotal)
	footers := []string{"Thank you"}
	return &receipt.Receipt{Headers: headers, Preface: preface, LineItems: items, Totals: totals, Payments: payments, Footers: footers}
}

func makeStore() Store {
	return &BasicStore{name: randomName(), mid: genMid()}
}

func randomName() string {
	n := rand.IntN(6) + 6
	rs := make([]rune, n)
	base := 0x41
	for i := 0; i < n; i++ {
		rs[i] = rune(base + rand.IntN(26))
		base = 0x61
	}
	return string(rs)
}

func genMid() string {
	n := rand.IntN(3) + 4
	rs := make([]rune, n)
	base := 0x31
	for i := 0; i < n; i++ {
		rs[i] = rune(base + rand.IntN(10))
	}
	return string(rs)
}

var categories = []string{"Grocery", "Hardware", "Clothing", "Electronics"}

func createLineItems() []receipt.LineItem {
	n := rand.IntN(6) + rand.IntN(12) + 1
	ret := make([]receipt.LineItem, n)
	for i := 0; i < n; i++ {
		ret[i] = createLineItem()
	}
	return ret
}

func createLineItem() receipt.LineItem {
	nd := rand.IntN(len(categories))
	desc := categories[nd]
	price := receipt.RandMoney()
	return receipt.LineItem{Desc: desc, Price: price, Comments: createComments()}
}

func createComments() []receipt.LineItemComment {
	nc := rand.IntN(2) * rand.IntN(3) // lean heavily towards zero, but allow 1 & 2, possibles: [ 0, 0, 0, 0, 1, 2]
	ret := make([]receipt.LineItemComment, nc)
	for i := 0; i < nc; i++ {
		ret[i] = createComment()
	}
	return ret
}

func createComment() receipt.LineItemComment {
	switch rand.IntN(2) {
	case 0:
		quant := rand.IntN(3) + 1
		price := receipt.RandMoney()
		return &receipt.LineItemQuant{Quant: quant, UnitPrice: price}
	case 1:
		return &receipt.LineItemMultiBuy{}
	default:
		panic("rand(2) was not 0 or 1")
	}
}

func figureTotals(items []receipt.LineItem) ([]receipt.TotalLine, receipt.Money) {
	subtotal := receipt.Money(0)
	discounts := receipt.Money(0)
	for _, item := range items {
		subtotal += item.Price
		for _, comment := range item.Comments {
			switch ds := comment.(type) {
			case *receipt.LineItemMultiBuy:
				discounts += ds.Discount
			default:
			}
		}
	}
	total := subtotal - discounts
	vat := total / 5
	ret := make([]receipt.TotalLine, 4)
	ret[0] = receipt.TotalLine{Type: 0x31, Text: "SubTotal", Amount: subtotal}
	ret[1] = receipt.TotalLine{Type: 0x32, Text: "Discounts", Amount: discounts}
	ret[2] = receipt.TotalLine{Type: 0x33, Text: "Including VAT", Amount: vat}
	ret[3] = receipt.TotalLine{Type: 0x3f, Text: "Total", Amount: total}
	return ret, total
}

func makePayment(amount receipt.Money) []receipt.PaymentLine {
	payment := receipt.PaymentLine{Method: "PHONE", Amount: amount}
	return []receipt.PaymentLine{payment}
}
