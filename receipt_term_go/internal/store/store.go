package store

import "github.com/gmmapowell/ignorance/receipt_term/internal/receipt"

type Store interface {
	MakePurchase() *receipt.Receipt
}
