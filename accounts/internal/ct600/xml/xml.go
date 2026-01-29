package xml

import (
	"log"
	"os"
	"reflect"

	"github.com/unix-world/smartgoext/xml-utils/etree"
)

func addElements(to *etree.Element, elts []etree.Token) {
	for _, e := range elts {
		if e != nil && !reflect.ValueOf(e).IsNil() {
			to.AddChild(e)
		}
	}
}

func ElementWithNesting(tag string, elts ...etree.Token) *etree.Element {
	env := etree.NewElement(tag)
	addElements(env, elts)
	return env
}

func ElementWithText(tag, value string, elts ...etree.Token) *etree.Element {
	env := etree.NewElement(tag)
	env.AddChild(env.CreateText(value))
	addElements(env, elts)
	return env
}

func ContentFromFile(filename string) *etree.Element {
	fp, err := os.Open(filename)
	if err != nil {
		log.Fatalf("Could not read %s: %v", filename, err)
	}
	defer fp.Close()
	doc := etree.NewDocument()
	_, err = doc.ReadFrom(fp)
	if err != nil {
		log.Fatalf("Could not read %s: %v", filename, err)
	}
	return doc.Element.ChildElements()[0]
}

func MakeGovTalkMessage(nesting ...etree.Token) *etree.Element {
	ret := etree.NewElement("GovTalkMessage")
	ret.Attr = append(ret.Attr, etree.Attr{Key: "xmlns", Value: "http://www.govtalk.gov.uk/CM/envelope"}, etree.Attr{Space: "xmlns", Key: "xsi", Value: "http://www.w3.org/2001/XMLSchema-instance"})
	addElements(ret, nesting)
	return ret
}

func MakeIRenvelopeMessage(nesting ...etree.Token) *etree.Element {
	ret := etree.NewElement("IRenvelope")
	ret.Attr = append(ret.Attr, etree.Attr{Key: "xmlns", Value: "http://www.govtalk.gov.uk/taxation/CT/5"}, etree.Attr{Space: "xmlns", Key: "xsi", Value: "http://www.w3.org/2001/XMLSchema-instance"})
	addElements(ret, nesting)
	return ret
}

func MakeCompanyTaxReturn(ty string, nested ...etree.Token) *etree.Element {
	ret := etree.NewElement("CompanyTaxReturn")
	ret.Attr = append(ret.Attr, etree.Attr{Key: "ReturnType", Value: ty})
	addElements(ret, nested)
	return ret
}

func Key(ty, value string) *etree.Element {
	ret := etree.NewElement("Key")
	ret.Attr = append(ret.Attr, etree.Attr{Key: "Type", Value: ty})
	ret.AddChild(ret.CreateText(value))
	return ret
}
