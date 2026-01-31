package ixbrl

import (
	"fmt"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/xml"
	"github.com/unix-world/smartgoext/xml-utils/etree"
)

type IXBRL struct {
	schema string
	title  string

	hidden   []*IXProp
	schemas  []*ixSchema
	contexts []*Context
}

type ixSchema struct {
	id, schema string
}

type IXProp struct {
	Type     int
	Context  string
	Name     string
	Format   string
	Decimals int
	Unit     string
	Text     string
}

type Date struct {
	isoDate string
}

type Context struct {
	ID               string
	IdentifierScheme string
	Identifier       string
	Instant          Date
	FromDate         Date
	ToDate           Date
	Segment          *Segment
}

type Segment struct {
	Dimension string
	Member    string
}

const (
	NonNumeric = iota
)

func (i *IXBRL) AddSchema(id, schema string) {
	i.schemas = append(i.schemas, &ixSchema{id: id, schema: schema})
}

func (i *IXBRL) AddHidden(h *IXProp) {
	i.hidden = append(i.hidden, h)
}

func (i *IXBRL) AddContext(c *Context) {
	i.contexts = append(i.contexts, c)
}

func ExplicitMember(dim, member string) *Segment {
	ret := Segment{Dimension: dim, Member: member}
	return &ret
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

	for _, s := range i.schemas {
		ret.Attr = append(ret.Attr, etree.Attr{Space: "xmlns", Key: s.id, Value: s.schema})
	}

	return ret
}

func (i *IXBRL) ixHeader() *etree.Element {
	ixhidden := xml.ElementWithNesting("ix:hidden")
	for _, ixp := range i.hidden {
		ixhidden.AddChild(ixp.AsEtree())
	}
	schemaLink := xml.ElementWithNesting("link:schemaRef")
	schemaLink.Attr = append(schemaLink.Attr, etree.Attr{Space: "xlink", Key: "href", Value: i.schema})
	schemaLink.Attr = append(schemaLink.Attr, etree.Attr{Space: "xlink", Key: "type", Value: "simple"})
	ixrefs := xml.ElementWithNesting("ix:references", schemaLink)
	ixresources := xml.ElementWithNesting("ix:resources")
	for _, cx := range i.contexts {
		ixresources.AddChild(cx.AsEtree())
	}
	ixheader := xml.ElementWithNesting("ix:header", ixhidden, ixrefs, ixresources)
	ret := xml.ElementWithNesting("div", ixheader)
	ret.Attr = append(ret.Attr, etree.Attr{Key: "style", Value: "display: none"})
	return ret
}

func NewIXBRL(title, schema string) *IXBRL {
	return &IXBRL{title: title, schema: schema}
}

func (ixp *IXProp) AsEtree() *etree.Element {
	var ty string
	switch ixp.Type {
	case NonNumeric:
		ty = "ix:nonNumeric"
	default:
		panic(fmt.Sprintf("invalid type: %d", ixp.Type))
	}
	ret := xml.ElementWithText(ty, ixp.Text)
	ret.Attr = append(ret.Attr, etree.Attr{Key: "contextRef", Value: ixp.Context})
	ret.Attr = append(ret.Attr, etree.Attr{Key: "name", Value: ixp.Name})
	if ixp.Format != "" {
		ret.Attr = append(ret.Attr, etree.Attr{Key: "format", Value: ixp.Format})
	}
	return ret
}

func (cx *Context) AsEtree() *etree.Element {
	ret := xml.ElementWithNesting("xbrli:context")
	ret.Attr = append(ret.Attr, etree.Attr{Key: "id", Value: cx.ID})
	entity := xml.ElementWithNesting("xbrli:entity")
	identifier := xml.ElementWithText("xbrli:identifier", cx.Identifier)
	identifier.Attr = append(identifier.Attr, etree.Attr{Key: "scheme", Value: cx.IdentifierScheme})
	entity.AddChild(identifier)
	if cx.Segment != nil {
		segment := xml.ElementWithNesting("xbrli:segment")
		expMember := xml.ElementWithText("xbrldi:explicitMember", cx.Segment.Member)
		expMember.Attr = append(expMember.Attr, etree.Attr{Key:"dimension", Value:cx.Segment.Dimension})
		segment.AddChild(expMember)
		entity.AddChild(segment)
	}
	ret.AddChild(entity)
	period := xml.ElementWithNesting("xbrli:period")
	if cx.Instant.isoDate != "" {
		instant := xml.ElementWithText("xbrli:instant", cx.Instant.isoDate)
		period.AddChild(instant)
	}
	if cx.FromDate.isoDate != "" {
		sd := xml.ElementWithText("xbrli:startDate", cx.FromDate.isoDate)
		period.AddChild(sd)
		ed := xml.ElementWithText("xbrli:endDate", cx.ToDate.isoDate)
		period.AddChild(ed)
	}
	ret.AddChild(period)
	return ret
}

func NewDate(iso string) Date {
	// TODO: check it is a valid date
	return Date{isoDate: iso}
}
