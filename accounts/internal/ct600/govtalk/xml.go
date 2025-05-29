package govtalk

import "encoding/xml"

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

type GovTalkMessageXML struct {
	XMLName xml.Name `xml:"GovTalkMessage"`
	XMLNS   string   `xml:"xmlns,attr"`
	XSI     string   `xml:"xmlns:xsi,attr"`
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

func MakeGovTalkMessage(nesting ...any) *GovTalkMessageXML {
	return &GovTalkMessageXML{
		XMLNS:    "http://www.govtalk.gov.uk/CM/envelope",
		XSI:      "http://www.w3.org/2001/XMLSchema-instance",
		Elements: nesting,
	}
}

func Key(ty, value string) *KeyElement {
	return &KeyElement{Type: ty, Value: value}
}
