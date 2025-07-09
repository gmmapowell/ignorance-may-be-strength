package submission

import (
	"bytes"
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"net/http"
)

func transmit(body io.Reader) ([]byte, error) {
	return transmitTo("https://test-transaction-engine.tax.service.gov.uk/submission", body)
}

func transmitTo(uri string, body io.Reader) ([]byte, error) {
	cli := &http.Client{}
	resp, err := cli.Post(uri, "application/x-binary", body)
	if err != nil {
		log.Fatalf("error posting xml file: %v", err)
	}
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("error reading response: %v", err)
	}
	return respBody, handleErrors(respBody)
}

type Error struct {
	raisedBy string
	number   string
	ofType   string
	message  string
	location string
}

func handleErrors(msg []byte) error {
	var all []*Error
	decoder := xml.NewDecoder(bytes.NewReader(msg))
	var errmsg *Error
	var data string
	for tok, err := decoder.Token(); err == nil; tok, err = decoder.Token() {
		switch tok := tok.(type) {
		case xml.StartElement:
			if tok.Name.Local == "Error" {
				errmsg = &Error{}
				all = append(all, errmsg)
			}
		case xml.EndElement:
			if tok.Name.Local == "Error" {
				errmsg = nil
			} else if errmsg != nil {
				switch tok.Name.Local {
				case "RaisedBy":
					errmsg.raisedBy = data
				case "Number":
					errmsg.number = data
				case "Type":
					errmsg.ofType = data
				case "Text":
					errmsg.message = data
				case "Location":
					errmsg.location = data
				}
			}
		case xml.CharData:
			data = string(tok)
		default:
			// log.Printf("%T", tok)
		}
	}

	if len(all) > 0 {
		fmt.Printf("%d error(s) reported:\n", len(all))
		fmt.Printf("  %-5s %-20s %-10s %-10s %-50s\n", "Code", "Raised By", "Location", "Type", "Message")
		for _, e := range all {
			fmt.Printf("  %-5s %-20s %-10s %-10s %-50s\n", e.number, e.raisedBy, e.location, e.ofType, e.message)
		}
		return fmt.Errorf("%d error(s) reported", len(all))
	}

	return nil
}
