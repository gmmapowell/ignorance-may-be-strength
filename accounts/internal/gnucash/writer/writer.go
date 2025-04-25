package writer

import (
	"encoding/xml"
	"os"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
)

const (
	header = `<?xml version="1.0" encoding="UTF-8"?>` + "\n"
)

type Writer struct {
	Config *config.Configuration
}

func (w *Writer) Deliver(accts *Gnucash) {
	bs, err := xml.MarshalIndent(accts, "", "  ")
	if err != nil {
		panic(err)
	}

	withHeader := header + string(bs)

	os.WriteFile(w.Config.Output, []byte(withHeader), 0666)
}

func MakeWriter(conf *config.Configuration) *Writer {
	return &Writer{Config: conf}
}
