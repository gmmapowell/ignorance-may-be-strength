package submission_test

import (
	"fmt"
	"io"
	"log"
	"testing"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/submission"
)

func TestWeCanConfigureSomething(t *testing.T) {
	config := &config.Config{}
	config.Sender = "me"
	config.Password = "secret"
	config.Utr = "1234509876"
	config.Vendor = "Ziniki"
	config.Product = "SendTax"
	config.Version = "2025-05-30-Alpha"
	send, err := submission.Generate(config)
	if err != nil {
		log.Fatalf("error generating xml file: %v", err)
	}

	readIt, err := io.ReadAll(send)
	if err != nil {
		log.Fatalf("error reading xml file: %v", err)
	}
	msg := string(readIt)
	fmt.Printf("%s\n", msg)
	/*
		cli := &http.Client{}
		resp, err := cli.Post("https://test-transaction-engine.tax.service.gov.uk/submission", "application/x-binary", send)
		if err != nil {
			log.Fatalf("error posting xml file: %v", err)
		}
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatalf("error reading response: %v", err)
		}
		msg := string(body)
		fmt.Printf("%s", msg)
		if strings.Contains(msg, "GovTalkErrors") {
			t.Fatalf("there was a GovTalkErrors block")
		}*/
}
