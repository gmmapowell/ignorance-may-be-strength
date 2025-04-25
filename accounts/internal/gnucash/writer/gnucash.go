package writer

import "encoding/xml"

type Gnucash struct {
	XMLName xml.Name `xml:"gnc-v2"`
	Namespaces
	Elements
}

type Namespaces struct {
	GNC string `xml:"xmlns:gnc,attr"`
	ACT string `xml:"xmlns:act,attr"`
}

type Elements []any

type CountData struct {
	XMLName xml.Name `xml:"gnc:count-data"`
	Type    string   `xml:"cd:type,attr"`
	Count   int      `xml:",chardata"`
}

type AccountBook struct {
	XMLName     xml.Name `xml:"gnc:book"`
	BookVersion string   `xml:"version,attr"`
}

func NewAccounts() *Gnucash {
	ret := Gnucash{}
	completeNamespaces(&ret)
	ret.Elements = append(ret.Elements, NewCountData("book", 1))
	ret.Elements = append(ret.Elements, NewAccountBook())
	return &ret
}

func completeNamespaces(gnc *Gnucash) {
	gnc.GNC = "http://www.gnucash.org/XML/gnc"
	gnc.ACT = "http://www.gnucash.org/XML/act"
}

func NewCountData(ty string, cnt int) *CountData {
	ret := CountData{Type: ty, Count: cnt}
	return &ret
}

func NewAccountBook() *AccountBook {
	ret := AccountBook{BookVersion: "2.0.0"}
	return &ret
}
