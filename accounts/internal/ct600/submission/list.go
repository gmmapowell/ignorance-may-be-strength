package submission

import (
	"bytes"
	"encoding/xml"
	"log"
	"slices"
	"strings"
	"time"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/govtalk"
)

type Record struct {
	time   time.Time
	corrId string
	status string
}

func List(conf *config.Configuration) error {
	pollOptions := &govtalk.EnvelopeOptions{Qualifier: "request", Function: "list", SendCorrelationID: true, IncludeSender: true}
	send, err := govtalk.Generate("", false, conf, pollOptions)
	if err != nil {
		return err
	}

	msg, err := transmit(send)

	if err != nil {
		return err
	}

	var summary []*Record
	decoder := xml.NewDecoder(bytes.NewReader(msg))
	var r *Record
	var data string
	for tok, err := decoder.Token(); err == nil; tok, err = decoder.Token() {
		switch tok := tok.(type) {
		case xml.StartElement:
			if tok.Name.Local == "StatusRecord" {
				r = &Record{}
				summary = append(summary, r)
			}
		case xml.EndElement:
			if tok.Name.Local == "StatusRecord" {
				r = nil
			} else if r != nil {
				switch tok.Name.Local {
				case "TimeStamp":
					log.Printf("parsing time %s", data)
					r.time, err = time.Parse("02/01/2006 15:04:05", data)
					if err != nil {
						log.Printf("failed to parse %s as a mm/dd/yyyy hh:mm:ss date", data)
					}
				case "CorrelationID":
					r.corrId = data
				case "Status":
					r.status = data
				}
			}
		case xml.CharData:
			data = string(tok)
		default:
			log.Printf("%T", tok)
		}
	}

	slices.SortFunc(summary, func(a, b *Record) int {
		ct := a.time.Compare(b.time)
		if ct != 0 {
			return ct
		}
		return strings.Compare(a.corrId, b.corrId)
	})

	for _, r := range summary {
		log.Printf("have %v %s %s\n", r.time.Format("2006-01-02 15:04:05"), r.corrId, r.status)
	}

	return nil
}
