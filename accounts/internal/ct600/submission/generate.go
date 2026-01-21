package submission

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"

	"io"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/govtalk"
	"github.com/unix-world/smartgoext/xml-utils/etree"
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

	body, err := msg.MakeCanonicalBody()
	if err != nil {
		return nil, err
	}

	m.IndentWithSettings(&etree.IndentSettings{Spaces: 2})
	w := bytes.Buffer{}
	ws := etree.WriteSettings{}
	m.WriteTo(&w, &ws)
	bs, err := AttachBodyTo(w.Bytes(), body)
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

func AttachBodyTo(bs []byte, body string) ([]byte, error) {
	return placeBefore(bs, "</GovTalkMessage>", body)
}

func placeBefore(bs []byte, match string, insert string) ([]byte, error) {
	str := string(bs)
	s1 := strings.Index(str, match)
	if s1 == -1 {
		return nil, fmt.Errorf("did not find " + match)
	}
	str = str[0:s1] + insert + str[s1:]
	bs = []byte(str)
	return bs, nil
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
