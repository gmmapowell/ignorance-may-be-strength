package submission

import (
	"bytes"
	"log"
	"strconv"
	"time"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/govtalk"
	"github.com/unix-world/smartgoext/xml-utils/etree"
)

func Submit(conf *config.Config) error {
	utr := conf.Utr
	if utr == "" {
		utr = conf.Business.TaxNum
	}
	ctr := &govtalk.IRenvelope{Business: conf.Business, ReturnType: "new",
		Sender: "Company", // the type of business we are, I believe.  The schema limits it to a handful of options

		UTR:         utr,
		PeriodStart: "2025-01-01", PeriodEnd: "2025-12-31",
		Turnover: 100000.0, TradingProfits: 0, LossesBroughtForward: 0, TradingNetProfits: 0,
		CorporationTax: 0,

		// AccountsIXBRL: "ct600/11110000_accounts.html",
		AccountsIXBRL: "ct600/accounts-section.xml",
		// ComputationIXBRL: "ct600/comps-section.xml",
		// ComputationIXBRL: "ct600/ixbrl-sample-2.xml",
		NoComputationsReason: "Not within charge to CT",
	}
	submitOptions := &govtalk.EnvelopeOptions{Qualifier: "request", Function: "submit", IncludeSender: true, IncludeKeys: true, IncludeBody: true, IRenvelope: ctr}
	send, err := govtalk.Generate("submit.xml", false, conf, submitOptions)
	if err != nil {
		return err
	}

	msg, err := transmit(send)

	if err != nil {
		return err
	}

	doc := etree.Document{}
	doc.ReadFrom(bytes.NewReader(msg))
	elt := doc.Element.ChildElements()[0]
	for {
		var waitFor time.Duration = 1
		pollOn := config.MakeBlankConfig()

		details := elt.FindElement("/GovTalkMessage/Header/MessageDetails")
		qualifier := details.FindElement("Qualifier")
		log.Printf("Qualifier: %s", qualifier.Text())
		function := details.FindElement("Function")
		log.Printf("Function: %s", function.Text())
		pollOn.CorrelationID = details.FindElement("CorrelationID").Text()
		log.Printf("CorrelationID: %s\n", pollOn.CorrelationID)
		rep := details.FindElement("ResponseEndPoint")
		if rep == nil {
			panic("not found")
		}
		a := rep.SelectAttr("PollInterval")
		tmp, err := strconv.Atoi(a.Value)
		if err != nil {
			log.Printf("failed to parse number %s\n", a.Value)
		} else {
			log.Printf("ResponseEndPoint PollInterval: %s\n", a.Value)
			waitFor = time.Duration(tmp)
		}
		pollOn.PollURI = rep.Text()
		log.Printf("ResponseEndPoint: %s\n", rep.Text())

		time.Sleep(waitFor * time.Second)
		elt, err = Poll(pollOn)

		if elt == nil || err != nil {
			return err
		}
	}
}
