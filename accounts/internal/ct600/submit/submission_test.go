package submission_test

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"testing"
)

func TestTheMinimalFileWorks(t *testing.T) {
	file, err := os.Open("../../../ct600/no-attach.xml")
	if err != nil {
		log.Fatalf("error reading xml file: %v", err)
	}

	cli := &http.Client{}
	resp, err := cli.Post("https://test-transaction-engine.tax.service.gov.uk/submission", "application/x-binary", file)
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
