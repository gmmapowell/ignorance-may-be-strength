package submission

import (
	"bytes"
	"encoding/xml"
	"fmt"
	"os"
	"os/exec"

	"io"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/govtalk"
)

func Generate(conf *config.Config, options *govtalk.EnvelopeOptions) (io.Reader, error) {
	msg := govtalk.MakeGovTalk(options)
	msg.Identity(conf.Sender, conf.Password)
	msg.Utr(conf.Utr)
	msg.Product(conf.Vendor, conf.Product, conf.Version)
	bs, err := xml.MarshalIndent(msg.AsXML(), "", "  ")
	if err != nil {
		return nil, err
	}

	checkAgainstSchema(bs)

	return bytes.NewReader(bs), nil
}

func checkAgainstSchema(bs []byte) {
	file, err := os.Create("submit.xml")
	if err != nil {
		panic(err)
	}
	file.Write(bs)
	file.Close()
	cmd := exec.Command("xmllint", "--schema", "ct600/xsd/importer.xsd", "--output", "out.xml", "submit.xml")
	output, err := cmd.CombinedOutput()
	if err != nil {
		panic(err)
	}
	result := string(output)
	fmt.Println("---- xmllint output")
	fmt.Print(result)
	fmt.Println("----")

	if result != "submit.xml validates\n" {
		panic("xml did not validate against schema; not submitting")
	}
}
