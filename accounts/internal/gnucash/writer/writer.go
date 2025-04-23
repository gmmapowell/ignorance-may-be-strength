package writer

import "github.com/gmmapowell/ignorance/accounts/internal/gnucash/accounts"

type Writer struct {
}

func (w *Writer) Deliver(accts accounts.Gnucash) {
	panic("unimplemented")
}

func MakeWriter(file string) *Writer {
	return &Writer{}
}
