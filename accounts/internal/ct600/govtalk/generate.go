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

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/accounts"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	conf "github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/sheets"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/writer"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/ixbrlgens"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/xml"
	"github.com/unix-world/smartgoext/xml-utils/etree"
	"github.com/unix-world/smartgoplus/xml-utils/c14n"
)

func Generate(file string, runlint bool, conf *conf.Configuration, options *EnvelopeOptions) (io.Reader, error) {
	gtxml, err := assembleGovTalkXML(conf, options)
	if err != nil {
		return nil, err
	}

	gtbs := xml.WriteXML(gtxml)

	if options.IncludeBody {
		w := writer.MakeWriter(conf)
		accts := accounts.MakeAccounts(conf, w)
		sheets.ReadSpreadsheet(conf, accts)

		acctranges := make(map[string]map[string]config.ReporterAccount)
		for name, fy := range conf.Ranges {
			// fmt.Printf("Collecting for FY %s\n", name)
			compiler := &ixbrlgens.Compiler{Accounts: make(map[string]config.ReporterAccount)}
			compiler.Configure(fy, conf.Accounts)
			accts.Regurgitate(compiler)

			compiler.DoCalculations(conf.Calculations)
			acctranges[name] = compiler.Accounts
		}

		for fy, accts := range acctranges {
			fmt.Printf("FY %s\n", fy)
			for acctName, acct := range accts {
				fmt.Printf("  Acct %s %s %v\n", acctName, acct.Type(), acct.Balance())
			}
		}

		bd := makeBody(conf, options.IRenvelope, acctranges)
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

func assembleGovTalkXML(conf *conf.Configuration, options *EnvelopeOptions) (*etree.Element, error) {
	msg := MakeGovTalk(options)
	msg.Identity(conf.Sender, conf.Password)
	msg.Utr(conf.Utr)
	msg.Product(conf.Vendor, conf.Product, conf.Version)
	return msg.AsXML()
}

func makeBody(conf *config.Configuration, env *IRenvelope, acctranges map[string]map[string]config.ReporterAccount) *etree.Element {
	env.Turnover = fillIn(conf.CT600, acctranges, "Turnover")
	env.TradingProfits = fillIn(conf.CT600, acctranges, "TradingProfits")
	env.LossesBroughtForward = fillIn(conf.CT600, acctranges,  "LossesBroughtForward")
	env.TradingNetProfits = fillIn(conf.CT600, acctranges, "TradingNetProfits")
	env.CorporationTax = fillIn(conf.CT600, acctranges, "CorporationTax")
	body := xml.ElementWithNesting("Body", env.AsXML(acctranges))
	xml.AddAttr(body, "xmlns", "http://www.govtalk.gov.uk/CM/envelope")
	xml.AddNSAttr(body, "xmlns", "xsi", "http://www.w3.org/2001/XMLSchema-instance")
	return body
}

func fillIn(entries map[string]*conf.CT600Entry, acctranges map[string]map[string]config.ReporterAccount, field string) conf.MyMoney {
	entry := entries[field]
	if entry == nil {
		panic("no entry found for " + field)
	}
	value := acctranges[entry.Year][entry.From]
	if value == nil {
		panic("no value found for " + field)
	}
	return value.Balance()
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
