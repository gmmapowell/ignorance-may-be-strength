package submission

import (
	"bytes"
	"encoding/xml"
	"log"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/govtalk"
)

func Submit(conf *config.Config) error {
	submitOptions := &govtalk.EnvelopeOptions{Qualifier: "request", Function: "submit", IncludeSender: true, IncludeKeys: true, IncludeBody: true}
	send, err := Generate(conf, submitOptions)
	if err != nil {
		return err
	}

	msg, err := transmit(send)

	if err != nil {
		return err
	}

	decoder := xml.NewDecoder(bytes.NewReader(msg))
	var data string
	for tok, err := decoder.Token(); err == nil; tok, err = decoder.Token() {
		switch tok := tok.(type) {
		case xml.StartElement:
		case xml.EndElement:
			if tok.Name.Local == "CorrelationID" {
				log.Printf("CorrelationID: %s\n", data)
			}
		case xml.CharData:
			data = string(tok)
		}
	}
	return nil
}
