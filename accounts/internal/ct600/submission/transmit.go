package submission

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

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
	fmt.Printf("%s", msg)
	if strings.Contains(msg, "GovTalkErrors") {
		fmt.Printf("%s", msg)
		return fmt.Errorf("there was a GovTalkErrors block")
	}

	return nil
}
