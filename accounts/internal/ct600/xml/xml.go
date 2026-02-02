package xml

import (
	"bytes"
	"io"
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

func ReadFile(filename string) string {
	fp, err := os.Open(filename)
	if err != nil {
		log.Fatalf("Could not read %s: %v", filename, err)
	}
	defer fp.Close()
	bs, err := io.ReadAll(fp)
	if err != nil {
		log.Fatalf("Could not read %s: %v", filename, err)
	}
	return string(bs)
}

func MakeGovTalkMessage(nesting ...etree.Token) *etree.Element {
	ret := etree.NewElement("GovTalkMessage")
	AddAttr(ret, "xmlns", "http://www.govtalk.gov.uk/CM/envelope")
	AddNSAttr(ret, "xmlns", "xsi", "http://www.w3.org/2001/XMLSchema-instance")
	addElements(ret, nesting)
	return ret
}

func MakeIRenvelopeMessage(nesting ...etree.Token) *etree.Element {
	ret := etree.NewElement("IRenvelope")
	AddAttr(ret, "xmlns", "http://www.govtalk.gov.uk/taxation/CT/5")
	AddNSAttr(ret, "xmlns", "xsi", "http://www.w3.org/2001/XMLSchema-instance")
	addElements(ret, nesting)
	return ret
}

func MakeCompanyTaxReturn(ty string, nested ...etree.Token) *etree.Element {
	ret := etree.NewElement("CompanyTaxReturn")
	AddAttr(ret, "ReturnType", ty)
	addElements(ret, nested)
	return ret
}

func Key(ty, value string) *etree.Element {
	ret := etree.NewElement("Key")
	AddAttr(ret, "Type", ty)
	ret.AddChild(ret.CreateText(value))
	return ret
}

func WriteXML(elt *etree.Element) []byte {
	elt.IndentWithSettings(&etree.IndentSettings{Spaces: 2})
	w := bytes.Buffer{}
	ws := etree.WriteSettings{}
	elt.WriteTo(&w, &ws)
	return w.Bytes()
}

func WriteEtree(filename string, elt *etree.Element) {
	bs := WriteXML(elt)
	file, err := os.Create(filename)
	if err != nil {
		panic(err)
	}
	file.Write(bs)
	file.Close()
}

func AddAttr(elt *etree.Element, key, value string) {
	elt.Attr = append(elt.Attr, etree.Attr{Key: key, Value: value})
}

func AddNSAttr(elt *etree.Element, space, key, value string) {
	elt.Attr = append(elt.Attr, etree.Attr{Space: space, Key: key, Value: value})
}
