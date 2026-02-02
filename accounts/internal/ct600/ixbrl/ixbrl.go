package ixbrl

import (
	"fmt"
	"time"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/xml"
	"github.com/unix-world/smartgoext/xml-utils/etree"
)

type MakeEtree interface {
	AsEtree() *etree.Element
}

type IXBRL struct {
	schema string
	title  string
	styles string

	hidden   []*IXProp
	schemas  []*ixSchema
	contexts []*Context
	pages    []*Page
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
	isoDate time.Time
}

type Context struct {
	ID               string
	IdentifierScheme string
	Identifier       string
	Instant          Date
	FromDate         Date
	ToDate           Date
	Segment          []*ExplicitMember
}

type ExplicitMember struct {
	Dimension string
	Member    string
}

type Page struct {
	Front  []*Div
	Header []*Div
	Rows   []*Row
}

type Row struct {
	Items []any
}

type Div struct {
	Tag   string
	Class string
	Text  string
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

func (i *IXBRL) AddPage() *Page {
	ret := &Page{}
	i.pages = append(i.pages, ret)
	return ret
}

func MakeExplicitMember(dim, member string) *ExplicitMember {
	ret := ExplicitMember{Dimension: dim, Member: member}
	return &ret
}

func (i *IXBRL) AsEtree() *etree.Element {
	metaContent := xml.ElementWithNesting("meta")
	xml.AddAttr(metaContent, "content", "application/xhtml+xml; charset=UTF-8")
	xml.AddAttr(metaContent, "http-equiv", "Content-Type")
	title := xml.ElementWithText("title", i.title)
	styles := xml.ElementWithText("style", xml.ReadFile(i.styles))
	xml.AddAttr(styles, "type", "text/css")
	head := xml.ElementWithNesting("head", metaContent, title, styles)
	body := xml.ElementWithNesting("body", i.ixHeader())
	for _, pg := range i.Pages() {
		body.AddChild(pg)
	}
	ret := xml.ElementWithNesting("html", head, body)
	xml.AddAttr(ret, "xmlns", "http://www.w3.org/1999/xhtml")
	xml.AddNSAttr(ret, "xmlns", "xsi", "http://www.w3.org/2001/XMLSchema-instance")

	xml.AddNSAttr(ret, "xmlns", "ix", "http://www.xbrl.org/2013/inlineXBRL")
	xml.AddNSAttr(ret, "xmlns", "ixt", "http://www.xbrl.org/inlineXBRL/transformation/2010-04-20")
	xml.AddNSAttr(ret, "xmlns", "ixt2", "http://www.xbrl.org/inlineXBRL/transformation/2011-07-31")
	xml.AddNSAttr(ret, "xmlns", "xbrli", "http://www.xbrl.org/2003/instance")
	xml.AddNSAttr(ret, "xmlns", "xbrldi", "http://xbrl.org/2006/xbrldi")
	xml.AddNSAttr(ret, "xmlns", "link", "http://www.xbrl.org/2003/linkbase")
	xml.AddNSAttr(ret, "xmlns", "xlink", "http://www.w3.org/1999/xlink")
	xml.AddNSAttr(ret, "xmlns", "iso4217", "http://www.xbrl.org/2003/iso4217")

	for _, s := range i.schemas {
		xml.AddNSAttr(ret, "xmlns", s.id, s.schema)
	}

	return ret
}

func (i *IXBRL) ixHeader() *etree.Element {
	var ixhidden *etree.Element
	if len(i.hidden) > 0 {
		ixhidden = xml.ElementWithNesting("ix:hidden")
		for _, ixp := range i.hidden {
			ixhidden.AddChild(ixp.AsEtree())
		}
	}
	schemaLink := xml.ElementWithNesting("link:schemaRef")
	xml.AddNSAttr(schemaLink, "xlink", "href", i.schema)
	xml.AddNSAttr(schemaLink, "xlink", "type", "simple")
	ixrefs := xml.ElementWithNesting("ix:references", schemaLink)
	ixresources := xml.ElementWithNesting("ix:resources")
	for _, cx := range i.contexts {
		ixresources.AddChild(cx.AsEtree())
	}
	ixheader := xml.ElementWithNesting("ix:header", ixhidden, ixrefs, ixresources)
	ret := xml.ElementWithNesting("div", ixheader)
	xml.AddAttr(ret, "style", "display: none")
	return ret
}

func (i *IXBRL) Pages() []*etree.Element {
	var ret []*etree.Element
	for pn, pg := range i.pages {
		ret = append(ret, pg.AsEtree(pn+1))
	}
	return ret
}

func NewIXBRL(title, schema, styles string) *IXBRL {
	return &IXBRL{title: title, schema: schema, styles: styles}
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
	xml.AddAttr(ret, "contextRef", ixp.Context)
	xml.AddAttr(ret, "name", ixp.Name)
	if ixp.Format != "" {
		xml.AddAttr(ret, "format", ixp.Format)
	}
	return ret
}

func (cx *Context) AsEtree() *etree.Element {
	ret := xml.ElementWithNesting("xbrli:context")
	xml.AddAttr(ret, "id", cx.ID)
	entity := xml.ElementWithNesting("xbrli:entity")
	identifier := xml.ElementWithText("xbrli:identifier", cx.Identifier)
	xml.AddAttr(identifier, "scheme", cx.IdentifierScheme)
	entity.AddChild(identifier)
	if cx.Segment != nil {
		segment := xml.ElementWithNesting("xbrli:segment")
		for _, sg := range cx.Segment {
			expMember := xml.ElementWithText("xbrldi:explicitMember", sg.Member)
			xml.AddAttr(expMember, "dimension", sg.Dimension)
			segment.AddChild(expMember)
		}
		entity.AddChild(segment)
	}
	ret.AddChild(entity)
	period := xml.ElementWithNesting("xbrli:period")
	if cx.Instant.IsValid() {
		instant := xml.ElementWithText("xbrli:instant", cx.Instant.IsoDate())
		period.AddChild(instant)
	}
	if cx.FromDate.IsValid() {
		sd := xml.ElementWithText("xbrli:startDate", cx.FromDate.IsoDate())
		period.AddChild(sd)
		ed := xml.ElementWithText("xbrli:endDate", cx.ToDate.IsoDate())
		period.AddChild(ed)
	}
	ret.AddChild(period)
	return ret
}

func (pg *Page) AddRow(items ...any) {
	pg.Rows = append(pg.Rows, &Row{Items: items})
}

func (pg *Page) AsEtree(pn int) *etree.Element {
	var front, header, table *etree.Element
	if pg.Front != nil {
		var divs []etree.Token
		for _, d := range pg.Front {
			divs = append(divs, d.AsEtree())
		}
		fpc := xml.ElementWithNesting("div", divs...)
		xml.AddAttr(fpc, "class", "frontpage-content")
		front = xml.ElementWithNesting("div", fpc)
		xml.AddAttr(front, "class", "frontpage")
	}
	if pg.Header != nil {
		var divs []etree.Token
		for _, d := range pg.Header {
			divs = append(divs, d.AsEtree())
		}
		header = xml.ElementWithNesting("div", divs...)
		xml.AddAttr(header, "class", "page-header")
	}
	if pg.Rows != nil {
		var rows []etree.Token
		for _, row := range pg.Rows {
			rows = append(rows, row.AsEtree())
		}
		table = xml.ElementWithNesting("table", rows...)
	}
	pageNum := xml.ElementWithText("p", fmt.Sprintf("Page %d", pn))
	xml.AddAttr(pageNum, "class", "center")
	hr := xml.ElementWithNesting("hr")
	xml.AddAttr(hr, "class", "_hr")
	footer := xml.ElementWithNesting("div", pageNum, hr)
	xml.AddAttr(footer, "class", "page-footer")
	ret := xml.ElementWithNesting("div", front, header, table, footer)
	xml.AddAttr(ret, "class", "page")
	return ret
}

func (d *Div) AsEtree() *etree.Element {
	tag := "div"
	if d.Tag != "" {
		tag = d.Tag
	}
	ret := xml.ElementWithText(tag, d.Text)
	if d.Class != "" {
		xml.AddAttr(ret, "class", d.Class)
	}
	return ret
}

func (r *Row) AsEtree() *etree.Element {
	var tds []etree.Token
	for _, i := range r.Items {
		var val etree.Token
		switch ti := i.(type) {
		case string:
			val = etree.NewText(ti)
		case MakeEtree:
			val = ti.AsEtree()
		default:
			panic(fmt.Sprintf("cannot handle %T", i))
		}
		tds = append(tds, xml.ElementWithNesting("td", val))
	}
	return xml.ElementWithNesting("tr", tds...)
}

func NewDate(iso string) Date {
	d, err := time.Parse(time.DateOnly, iso)
	if err != nil {
		panic(fmt.Sprintf("error parsing date '%s': %v", iso, err))
	}
	return Date{isoDate: d}
}

func (d Date) IsValid() bool {
	return !d.isoDate.IsZero()
}

func (d Date) IsoDate() string {
	return d.isoDate.Format(time.DateOnly)
}

func (d Date) UKFullDate() string {
	return d.isoDate.Format("2 January 2006")
}
