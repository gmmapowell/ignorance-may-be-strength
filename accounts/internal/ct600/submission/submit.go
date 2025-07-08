package submission

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
)

func Submit(conf *config.Config) error {
	send, err := Generate(conf)
	if err != nil {
		return err
	}

	return transmit(send)
}

func transmit(body io.Reader) error {
	cli := &http.Client{}
	resp, err := cli.Post("https://test-transaction-engine.tax.service.gov.uk/submission", "application/x-binary", body)
	if err != nil {
		log.Fatalf("error posting xml file: %v", err)
	}
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("error reading response: %v", err)
	}
	msg := string(respBody)
	// fmt.Printf("%s", msg)
	if strings.Contains(msg, "GovTalkErrors") {
		return fmt.Errorf("there was a GovTalkErrors block")
	}

	return nil
}
