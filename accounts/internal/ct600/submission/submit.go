package submission

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/govtalk"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/ixbrlgens"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/unix-world/smartgoext/xml-utils/etree"
)

func Submit(conf *config.Configuration) error {
	if _, err := os.Stat(conf.SubmitDir); err != nil {
		panic(fmt.Sprintf("submit dir does not exist: %s", conf.SubmitDir))
	}
	writeTo := filepath.Join(conf.SubmitDir, conf.Ranges["CY"].End)
	if _, err := os.Stat(writeTo); err == nil {
		panic(fmt.Sprintf("output dir already exists: %s", writeTo))
	}
	log.Printf("writing to %s", writeTo)
	if err := os.Mkdir(writeTo, 0777); err != nil {
		panic(fmt.Sprintf("failed to created dir %s, %v", writeTo, err))
	}
	utr := conf.Utr
	if conf.Utr == "" {
		conf.Utr = conf.Business.TaxNum
	}
	ctr := &govtalk.IRenvelope{Business: conf.Business, ReturnType: "new",
		Sender: "Company", // the type of business we are, I believe.  The schema limits it to a handful of options

		UTR:         utr,
		PeriodStart: conf.Ranges["CY"].Start, PeriodEnd: conf.Ranges["CY"].End,

		AccountsGenerator:     ixbrlgens.AccountsGenerator(conf, "ct600/acct-styles.css"),
		ComputationsGenerator: ixbrlgens.ComputationsGenerator(conf, "ct600/comp-styles.css"),
	}

	submitOptions := &govtalk.EnvelopeOptions{Qualifier: "request", Function: "submit", IncludeSender: true, IncludeKeys: true, IncludeBody: true, IRenvelope: ctr}
	send, err := govtalk.Generate(filepath.Join(writeTo, "submit.xml"), false, conf, submitOptions)
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
	rf := filepath.Join(writeTo, "response.xml")
	for {
		var waitFor time.Duration = 1
		pollOn := config.MakeConfiguration()

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
		elt, err = Poll(rf, pollOn)

		if elt == nil || err != nil {
			return err
		}
	}
}
