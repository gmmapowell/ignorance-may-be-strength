package writer

import (
	"encoding/xml"
	"fmt"
	"os"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
)

const (
	header = `<?xml version="1.0" encoding="utf-8" ?>` + "\n"
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

	err = os.WriteFile(w.Config.Output, []byte(withHeader), 0666)
	if err != nil {
		panic(fmt.Sprintf("could not write to %s, error = %v", w.Config.Output, err))
	}
}

func MakeWriter(conf *config.Configuration) *Writer {
	return &Writer{Config: conf}
}
