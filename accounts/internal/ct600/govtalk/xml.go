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
