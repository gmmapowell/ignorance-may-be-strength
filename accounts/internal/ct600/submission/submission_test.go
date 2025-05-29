package submission_test

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"testing"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/submission"
)

func TestTheMinimalFileWorks(t *testing.T) {
	send, err := submission.Generate()
	if err != nil {
		log.Fatalf("error generating xml file: %v", err)
	}

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
	}
}
