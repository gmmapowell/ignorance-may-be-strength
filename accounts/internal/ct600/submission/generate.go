package submission

import (
	"bytes"
	"encoding/xml"
	"fmt"
	"log"
	"os"
	"os/exec"

	"io"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/govtalk"
)

func Generate(file string, runlint bool, conf *config.Config, options *govtalk.EnvelopeOptions) (io.Reader, error) {
	msg := govtalk.MakeGovTalk(options)
	msg.Identity(conf.Sender, conf.Password)
	msg.Utr(conf.Utr)
	msg.Product(conf.Vendor, conf.Product, conf.Version)
	m, err := msg.AsXML()
	if err != nil {
		return nil, err
	}
	bs, err := xml.MarshalIndent(m, "", "  ")
	if err != nil {
		return nil, err
	}
	bs, err = m.AttachBodyTo(bs)
	if err != nil {
		return nil, err
	}

	bs = []byte(string(bs) + "\n")

	if file != "" {
		err = checkAgainstSchema(file, runlint, bs)
		if err != nil {
			return nil, err
		}
	}

	return bytes.NewReader(bs), nil
}

func checkAgainstSchema(filename string, runlint bool, bs []byte) error {
	file, err := os.Create(filename)
	if err != nil {
		panic(err)
	}
	file.Write(bs)
	file.Close()
	if runlint {
		log.Println("submitting file to xmllint")
		cmd := exec.Command("xmllint", "--schema", "ct600/xsd/importer.xsd", "--output", "out.xml", "submit.xml")
		output, err := cmd.CombinedOutput()
		result := string(output)
		log.Println("---- xmllint output")
		fmt.Print(result)
		log.Println("----")

		if err != nil {
			return err
		}

		if result != "submit.xml validates\n" {
			return fmt.Errorf("xml did not validate against schema; not submitting")
		}
	}
	return nil
}
