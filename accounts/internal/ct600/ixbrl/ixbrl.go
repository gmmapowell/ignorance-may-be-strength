package ixbrl

import (
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/xml"
	"github.com/unix-world/smartgoext/xml-utils/etree"
)

type IXBRL struct {
	title string
}

func (i *IXBRL) AsEtree() *etree.Element {
	metaContent := xml.ElementWithNesting("meta")
	metaContent.Attr = append(metaContent.Attr, etree.Attr{Key: "content", Value: "application/xhtml+xml; charset=UTF-8"}, etree.Attr{Key: "http-equiv", Value: "Content-Type"})
	title := xml.ElementWithText("title", i.title)
	head := xml.ElementWithNesting("head", metaContent, title)
	body := xml.ElementWithNesting("body", i.ixHeader())
	ret := xml.ElementWithNesting("html", head, body)
	ret.Attr = append(ret.Attr, etree.Attr{Key: "xmlns", Value: "http://www.w3.org/1999/xhtml"}, etree.Attr{Space: "xmlns", Key: "xsi", Value: "http://www.w3.org/2001/XMLSchema-instance"})

	ret.Attr = append(ret.Attr, etree.Attr{Space: "xmlns", Key: "ix", Value: "http://www.xbrl.org/2013/inlineXBRL"})
	ret.Attr = append(ret.Attr, etree.Attr{Space: "xmlns", Key: "ixt", Value: "http://www.xbrl.org/inlineXBRL/transformation/2010-04-20"})
	ret.Attr = append(ret.Attr, etree.Attr{Space: "xmlns", Key: "ixt2", Value: "http://www.xbrl.org/inlineXBRL/transformation/2011-07-31"})
	ret.Attr = append(ret.Attr, etree.Attr{Space: "xmlns", Key: "xbrli", Value: "http://www.xbrl.org/2003/instance"})
	ret.Attr = append(ret.Attr, etree.Attr{Space: "xmlns", Key: "xbrldi", Value: "http://xbrl.org/2006/xbrldi"})
	ret.Attr = append(ret.Attr, etree.Attr{Space: "xmlns", Key: "link", Value: "http://www.xbrl.org/2003/linkbase"})
	ret.Attr = append(ret.Attr, etree.Attr{Space: "xmlns", Key: "xlink", Value: "http://www.w3.org/1999/xlink"})
	ret.Attr = append(ret.Attr, etree.Attr{Space: "xmlns", Key: "iso4217", Value: "http://www.xbrl.org/2003/iso4217"})

	return ret
}

func (i *IXBRL) ixHeader() *etree.Element {
	ixhidden := xml.ElementWithNesting("ix:hidden")
	ixrefs := xml.ElementWithNesting("ix:references")
	ixresources := xml.ElementWithNesting("ix:resources")
	ixheader := xml.ElementWithNesting("ix:header", ixhidden, ixrefs, ixresources)
	ret := xml.ElementWithNesting("div", ixheader)
	ret.Attr = append(ret.Attr, etree.Attr{Key: "style", Value: "display: none"})
	return ret
}

func NewIXBRL() *IXBRL {
	return &IXBRL{}
}
