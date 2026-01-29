package govtalk

import (
	"bytes"
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"

	"io"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/xml"
	"github.com/unix-world/smartgoext/xml-utils/etree"
	"github.com/unix-world/smartgoplus/xml-utils/c14n"
)

func Generate(file string, runlint bool, conf *config.Config, options *EnvelopeOptions) (io.Reader, error) {
	gtxml, err := assembleGovTalkXML(conf, options)
	if err != nil {
		return nil, err
	}

	gtbs := writeXML(gtxml)

	if options.IncludeBody {
		bd := makeBody(options.IRenvelope)
		bs, err := canonicaliseBody(bd)
		if err != nil {
			return nil, err
		}
		bs, err = placeBefore(bs, "\n      <Sender>", "\n      ")
		if err != nil {
			return nil, err
		}
		body, err := insertIRmark(bs)
		if err != nil {
			return nil, err
		}
		gtbs, err = attachBodyTo(gtbs, body)
		if err != nil {
			return nil, err
		}
		gtbs = []byte(string(gtbs) + "\n")
	}

	if file != "" {
		err = checkAgainstSchema(file, runlint, gtbs)
		if err != nil {
			return nil, err
		}
	}

	return bytes.NewReader(gtbs), nil
}

func assembleGovTalkXML(conf *config.Config, options *EnvelopeOptions) (*etree.Element, error) {
	msg := MakeGovTalk(options)
	msg.Identity(conf.Sender, conf.Password)
	msg.Utr(conf.Utr)
	msg.Product(conf.Vendor, conf.Product, conf.Version)
	return msg.AsXML()
}

func makeBody(env *IRenvelope) *etree.Element {
	body := xml.ElementWithNesting("Body", env.AsXML())
	body.Attr = append(body.Attr, etree.Attr{Key: "xmlns", Value: "http://www.govtalk.gov.uk/CM/envelope"}, etree.Attr{Space: "xmlns", Key: "xsi", Value: "http://www.w3.org/2001/XMLSchema-instance"})
	return body
}

func writeXML(elt *etree.Element) []byte {
	elt.IndentWithSettings(&etree.IndentSettings{Spaces: 2})
	w := bytes.Buffer{}
	ws := etree.WriteSettings{}
	elt.WriteTo(&w, &ws)
	return w.Bytes()
}

func attachBodyTo(bs []byte, body string) ([]byte, error) {
	return placeBefore(bs, "</GovTalkMessage>", body)
}

func canonicaliseBody(body *etree.Element) ([]byte, error) {
	body.IndentWithSettings(&etree.IndentSettings{Spaces: 2})
	canon := c14n.MakeC14N11Canonicalizer()
	return canon.Canonicalize(body)
}

func insertIRmark(body []byte) (string, error) {
	// Generate a SHA-1 encoding
	hasher := sha1.New()
	_, err := hasher.Write(body)
	if err != nil {
		return "", err
	}
	sha := hasher.Sum(nil)

	// And then turn that into Base64
	w := new(bytes.Buffer)
	enc := base64.NewEncoder(base64.StdEncoding, w)
	enc.Write(sha)
	enc.Close()

	// The string of this is the IRmark
	b64sha := w.String()

	// Add the IRmark
	bs, err := placeBefore(body, "\n      <Sender>", `<IRmark Type="generic">`+b64sha+"</IRmark>")
	if err != nil {
		return "", err
	}

	// Fix up whitespace around Body
	ret := "  " + string(bs) + "\n"

	return ret, err
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
