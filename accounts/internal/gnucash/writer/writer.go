package writer

import (
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/accounts"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
)

type Writer struct {
}

func (w *Writer) Deliver(accts accounts.Gnucash) {
	panic("unimplemented")
}

func MakeWriter(conf *config.Configuration) *Writer {
	return &Writer{}
}
