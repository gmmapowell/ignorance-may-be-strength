package govtalk

import (
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
	canonBody string
	Elements
}

type BodySchemaXML struct {
	XMLName xml.Name `xml:"Body"`
	XMLNS   string   `xml:"xmlns,attr"`
	XSI     string   `xml:"xmlns:xsi,attr"`
	Elements
}

type IRenvelopeXML struct {
	XMLName xml.Name `xml:"IRenvelope"`
	XMLNS   string   `xml:"xmlns,attr"`
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

func MakeGovTalkMessage(canonBody string, nesting ...any) *GovTalkMessageXML {
	return &GovTalkMessageXML{
		XMLNS:     "http://www.govtalk.gov.uk/CM/envelope",
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
		Elements: nesting,
	}
}

func MakeBodyWithSchemaMessage(nesting ...any) *BodySchemaXML {
	return &BodySchemaXML{
		XMLNS:    "http://www.govtalk.gov.uk/CM/envelope",
		XSI:      "http://www.w3.org/2001/XMLSchema-instance",
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
