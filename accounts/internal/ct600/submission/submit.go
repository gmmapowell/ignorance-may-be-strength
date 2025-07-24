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
	utr := conf.Utr
	if utr == "" {
		utr = conf.Business.TaxNum
	}
	ctr := &govtalk.IRenvelope{Business: conf.Business, ReturnType: "new",
		Sender: "Company", // the type of business we are, I believe.  The schema limits it to a handful of options

		UTR:         utr,
		PeriodStart: "2021-04-01", PeriodEnd: "2022-03-31",
		Turnover: 100000.0, TradingProfits: 0, LossesBroughtForward: 0, TradingNetProfits: 0,
		CorporationTax: 0,

		AccountsIXBRL: "ct600/iXBRL-sample-ct-comp-2023.xhtml",
		NoComputationsReason: "Not within charge to CT",
	}
	submitOptions := &govtalk.EnvelopeOptions{Qualifier: "request", Function: "submit", IncludeSender: true, IncludeKeys: true, IncludeBody: true, IRenvelope: ctr}
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
