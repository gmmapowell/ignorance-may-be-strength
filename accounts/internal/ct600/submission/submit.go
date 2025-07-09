package submission

import (
	"bytes"
	"encoding/xml"
	"log"
	"strconv"
	"time"

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
	var waitFor time.Duration = 10
	pollOn := config.MakeBlankConfig()
	for tok, err := decoder.Token(); err == nil; tok, err = decoder.Token() {
		switch tok := tok.(type) {
		case xml.StartElement:
			switch tok.Name.Local {
			case "ResponseEndPoint":
				for _, a := range tok.Attr {
					if a.Name.Local == "PollInterval" {
						log.Printf("ResponseEndPoint PollInterval: %s\n", a.Value)
						tmp, err := strconv.Atoi(a.Value)
						if err != nil {
							log.Printf("failed to parse number %s\n", a.Value)
						} else {
							waitFor = time.Duration(tmp)
						}
					}
				}
			}
		case xml.EndElement:
			switch tok.Name.Local {
			case "Function":
				log.Printf("Function: %s\n", data)
			case "Qualifier":
				log.Printf("Qualifier: %s\n", data)
			case "CorrelationID":
				log.Printf("CorrelationID: %s\n", data)
				pollOn.CorrelationID = data
			case "ResponseEndPoint":
				log.Printf("ResponseEndPoint: %s\n", data)
				pollOn.PollURI = data
			}
		case xml.CharData:
			data = string(tok)
		}
	}

	time.Sleep(waitFor * time.Second)
	Poll(pollOn)

	return nil
}
