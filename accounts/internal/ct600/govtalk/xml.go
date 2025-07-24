package govtalk

import (
	"bytes"
	"encoding/base64"
	"encoding/xml"
	"io"
	"log"
	"os"
)

type SimpleElement struct {
	XMLName xml.Name
	Text    string `xml:",chardata"`
	Elements
}

type KeyElement struct {
	XMLName xml.Name `xml:"Key"`
	Type    string   `xml:"Type,attr"`
	Value   string   `xml:",chardata"`
}

type ContentElement struct {
	XMLName xml.Name
	Content []byte `xml:",innerxml"`
}

type GovTalkMessageXML struct {
	XMLName   xml.Name `xml:"GovTalkMessage"`
	XMLNS     string   `xml:"xmlns,attr"`
	XSI       string   `xml:"xmlns:xsi,attr"`
	ISO4217   string   `xml:"xmlns:iso4217,attr"`
	CTCOMP    string   `xml:"xmlns:ct-comp,attr"`
	canonBody string
	Elements
}

type BodySchemaXML struct {
	XMLName xml.Name `xml:"Body"`
	XMLNS   string   `xml:"xmlns,attr"`
	XSI     string   `xml:"xmlns:xsi,attr"`
	CTCOMP  string   `xml:"xmlns:ct-comp,attr"`
	Elements
}

type IRenvelopeXML struct {
	XMLName xml.Name `xml:"IRenvelope"`
	XMLNS   string   `xml:"xmlns,attr"`
	ISO4217 string   `xml:"xmlns:iso4217,attr"`
	Elements
}

type IRmarkXML struct {
	XMLName xml.Name `xml:"IRmark"`
	Type    string   `xml:",attr"`
	Text    string   `xml:",chardata"`
}

type CompanyTaxReturnXML struct {
	XMLName    xml.Name `xml:"CompanyTaxReturn"`
	ReturnType string   `xml:",attr"`
	Elements
}

type Elements []any

func ElementWithNesting(tag string, elts ...any) *SimpleElement {
	env := &SimpleElement{XMLName: xml.Name{Local: tag}}
	env.Elements = elts
	return env
}

func ElementWithText(tag, value string, elts ...any) *SimpleElement {
	env := &SimpleElement{XMLName: xml.Name{Local: tag}}
	env.Text = value
	env.Elements = elts
	return env
}

func ContentFromFile(tag, filename string) *ContentElement {
	fp, err := os.Open(filename)
	if err != nil {
		log.Fatalf("Could not read %s: %v", filename, err)
	}
	defer fp.Close()
	bs, err := io.ReadAll(fp)
	if err != nil {
		log.Fatalf("Could not read %s: %v", filename, err)
	}
	return &ContentElement{XMLName: xml.Name{Local: tag}, Content: bs}
}

func EncodeContentFromFile(tag, filename string) *ContentElement {
	fp, err := os.Open(filename)
	if err != nil {
		log.Fatalf("Could not read %s: %v", filename, err)
	}
	defer fp.Close()
	w := new(bytes.Buffer)
	enc := base64.NewEncoder(base64.StdEncoding, w)
	defer enc.Close()
	_, err = io.Copy(enc, fp)
	if err != nil {
		log.Fatalf("Could not read %s: %v", filename, err)
	}

	return &ContentElement{XMLName: xml.Name{Local: tag}, Content: w.Bytes()}
}

func MakeGovTalkMessage(canonBody string, nesting ...any) *GovTalkMessageXML {
	return &GovTalkMessageXML{
		XMLNS:     "http://www.govtalk.gov.uk/CM/envelope",
		XSI:       "http://www.w3.org/2001/XMLSchema-instance",
		ISO4217:   "http://www.xbrl.org/2003/iso4217",
		CTCOMP:    "http://www.hmrc.gov.uk/schemas/ct/comp/2023-01-01",
		canonBody: canonBody,
		Elements:  nesting,
	}
}

func (gtx *GovTalkMessageXML) AttachBodyTo(bs []byte) ([]byte, error) {
	return placeBefore(bs, "</GovTalkMessage>", gtx.canonBody)
}

func MakeIRenvelopeMessage(nesting ...any) *IRenvelopeXML {
	return &IRenvelopeXML{
		XMLNS:    "http://www.govtalk.gov.uk/taxation/CT/5",
		ISO4217:  "http://www.xbrl.org/2003/iso4217",
		Elements: nesting,
	}
}

func MakeBodyWithSchemaMessage(nesting ...any) *BodySchemaXML {
	return &BodySchemaXML{
		XMLNS:    "http://www.govtalk.gov.uk/CM/envelope",
		XSI:      "http://www.w3.org/2001/XMLSchema-instance",
		CTCOMP:   "http://www.hmrc.gov.uk/schemas/ct/comp/2023-01-01",
		Elements: nesting,
	}
}

func MakeIRmark(irmark string) *IRmarkXML {
	return &IRmarkXML{
		Type: "generic",
		Text: irmark,
	}
}

func MakeCompanyTaxReturn(ty string, nested ...any) *CompanyTaxReturnXML {
	return &CompanyTaxReturnXML{
		ReturnType: ty,
		Elements:   nested,
	}
}

func Key(ty, value string) *KeyElement {
	return &KeyElement{Type: ty, Value: value}
}
