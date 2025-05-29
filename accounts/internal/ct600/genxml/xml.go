package genxml

import (
	"encoding/xml"
)

type Element struct {
	XMLName    xml.Name
	Attributes `xml:",innerxml"`
	Elements
}

type Attributes any
type Elements []any

type GTAttrs struct {
	XMLNS string `xml:"xmlns,attr"`
}

func LocalElement(name string) *Element {
	return &Element{XMLName: xml.Name{Local: name}, Attributes: GTAttrs{XMLNS: "http://www.govtalk.gov.uk/CM/envelope"}}
}
