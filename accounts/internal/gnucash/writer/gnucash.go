package writer

import (
	"encoding/xml"
	"strings"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/google/uuid"
)

type Gnucash struct {
	XMLName xml.Name `xml:"gnc-v2"`
	Namespaces
	Elements
}

type Namespaces struct {
	GNC        string `xml:"xmlns:gnc,attr"`
	ACT        string `xml:"xmlns:act,attr"`
	BOOK       string `xml:"xmlns:book,attr"`
	CD         string `xml:"xmlns:cd,attr"`
	CMDTY      string `xml:"xmlns:cmdty,attr"`
	PRICE      string `xml:"xmlns:price,attr"`
	SLOT       string `xml:"xmlns:slot,attr"`
	SPLIT      string `xml:"xmlns:split,attr"`
	SX         string `xml:"xmlns:sx,attr"`
	TRN        string `xml:"xmlns:trn,attr"`
	TS         string `xml:"xmlns:ts,attr"`
	FS         string `xml:"xmlns:fs,attr"`
	BGT        string `xml:"xmlns:bgt,attr"`
	RECURRENCE string `xml:"xmlns:recurrence,attr"`
	LOT        string `xml:"xmlns:lot,attr"`
	ADDR       string `xml:"xmlns:addr,attr"`
	BILLTERM   string `xml:"xmlns:billterm,attr"`
	BTDAYS     string `xml:"xmlns:bt-days,attr"`
	BTPROX     string `xml:"xmlns:bt-prox,attr"`
	CUST       string `xml:"xmlns:cust,attr"`
	EMPLOYEE   string `xml:"xmlns:employee,attr"`
	ENTRY      string `xml:"xmlns:entry,attr"`
	INVOICE    string `xml:"xmlns:invoice,attr"`
	JOB        string `xml:"xmlns:job,attr"`
	ORDER      string `xml:"xmlns:order,attr"`
	OWNER      string `xml:"xmlns:owner,attr"`
	TAXTABLE   string `xml:"xmlns:taxtable,attr"`
	TTE        string `xml:"xmlns:tte,attr"`
	VENDOR     string `xml:"xmlns:vendor,attr"`
}

type AnonymousValue any
type Elements []any

type CountData struct {
	XMLName xml.Name `xml:"gnc:count-data"`
	Type    string   `xml:"cd:type,attr"`
	Count   int      `xml:",chardata"`
}

type AccountBook struct {
	XMLName     xml.Name `xml:"gnc:book"`
	BookVersion string   `xml:"version,attr"`
	Elements
}

type BookId struct {
	XMLName xml.Name `xml:"book:id"`
	Type    string   `xml:"type,attr"`
	Guid    string   `xml:",chardata"`
}

type BookSlots struct {
	XMLName xml.Name `xml:"book:slots"`
	Elements
}

type Slot struct {
	XMLName xml.Name `xml:"slot"`
	Key     SlotKey
	Value   SlotValue `xml:",innerxml"`
}

type SlotKey struct {
	XMLName xml.Name `xml:"slot:key"`
	Key     string   `xml:",chardata"`
}

type SlotValue struct {
	XMLName        xml.Name `xml:"slot:value"`
	Type           string   `xml:"type,attr"`
	StringValue    string   `xml:",chardata"`
	AnonymousValue `xml:",innerxml"`
}

type Commodity struct {
	XMLName xml.Name `xml:"gnc:commodity"`
	Version string   `xml:"version,attr"`
	Elements
}

type CommodityItem struct {
	XMLName xml.Name
	Value   string `xml:",chardata"`
}

type Account struct {
	XMLName xml.Name `xml:"gnc:account"`
	Version string   `xml:"version,attr"`
	Elements
}

type AccountItem struct {
	XMLName xml.Name
	Type    string `xml:"type,attr,omitempty"`
	Value   string `xml:",chardata"`
	Elements
}

func NewAccounts(conf *config.Configuration) *Gnucash {
	ret := Gnucash{}
	completeNamespaces(&ret)
	ret.Elements = append(ret.Elements, NewCountData("book", 1))
	ret.Elements = append(ret.Elements, NewAccountBook(conf))
	return &ret
}

func completeNamespaces(gnc *Gnucash) {
	gnc.GNC = "http://www.gnucash.org/XML/gnc"
	gnc.ACT = "http://www.gnucash.org/XML/act"
	gnc.BOOK = "http://www.gnucash.org/XML/book"
	gnc.CD = "http://www.gnucash.org/XML/cd"
	gnc.CMDTY = "http://www.gnucash.org/XML/cmdty"
	gnc.PRICE = "http://www.gnucash.org/XML/price"
	gnc.SLOT = "http://www.gnucash.org/XML/slot"
	gnc.SPLIT = "http://www.gnucash.org/XML/split"
	gnc.SX = "http://www.gnucash.org/XML/sx"
	gnc.TRN = "http://www.gnucash.org/XML/trn"
	gnc.TS = "http://www.gnucash.org/XML/ts"
	gnc.FS = "http://www.gnucash.org/XML/fs"
	gnc.BGT = "http://www.gnucash.org/XML/bgt"
	gnc.RECURRENCE = "http://www.gnucash.org/XML/recurrence"
	gnc.LOT = "http://www.gnucash.org/XML/lot"
	gnc.ADDR = "http://www.gnucash.org/XML/addr"
	gnc.BILLTERM = "http://www.gnucash.org/XML/billterm"
	gnc.BTDAYS = "http://www.gnucash.org/XML/bt-days"
	gnc.BTPROX = "http://www.gnucash.org/XML/bt-prox"
	gnc.CUST = "http://www.gnucash.org/XML/cust"
	gnc.EMPLOYEE = "http://www.gnucash.org/XML/employee"
	gnc.ENTRY = "http://www.gnucash.org/XML/entry"
	gnc.INVOICE = "http://www.gnucash.org/XML/invoice"
	gnc.JOB = "http://www.gnucash.org/XML/job"
	gnc.ORDER = "http://www.gnucash.org/XML/order"
	gnc.OWNER = "http://www.gnucash.org/XML/owner"
	gnc.TAXTABLE = "http://www.gnucash.org/XML/taxtable"
	gnc.TTE = "http://www.gnucash.org/XML/tte"
	gnc.VENDOR = "http://www.gnucash.org/XML/vendor"
}

func NewCountData(ty string, cnt int) *CountData {
	ret := CountData{Type: ty, Count: cnt}
	return &ret
}

func NewAccountBook(conf *config.Configuration) *AccountBook {
	ret := AccountBook{BookVersion: "2.0.0"}
	bookId := BookId{Type: "guid", Guid: "95d515f6a8ef4c6fb50d245c82e125b3"}
	ret.Elements = append(ret.Elements, bookId)
	slots := BookSlots{}
	opts := MakeSlot("options", "frame")
	opts.Value.AnonymousValue = []any{FillBusiness(conf), FillTax(conf)}
	slots.Elements = append(slots.Elements, opts)
	ret.Elements = append(ret.Elements, slots)

	mappedAccounts := mapAccounts(conf)

	commodities := CountData{Type: "commodity", Count: 1}
	ret.Elements = append(ret.Elements, commodities)
	accounts := CountData{Type: "account", Count: len(mappedAccounts)}
	ret.Elements = append(ret.Elements, accounts)
	txns := CountData{Type: "transaction", Count: 3} // TODO: figure out this number
	ret.Elements = append(ret.Elements, txns)

	gbp := Commodity{Version: "2.0.0"}
	space := NewCommodityItem("space", "CURRENCY")
	id := NewCommodityItem("id", "GBP")
	gq := NewCommodityItem("get_quotes", "")
	qs := NewCommodityItem("quote_source", "currency")
	qtz := NewCommodityItem("quote_tz", "")
	gbp.Elements = []any{space, id, gq, qs, qtz}
	ret.Elements = append(ret.Elements, gbp)

	ret.Elements = append(ret.Elements, mappedAccounts...)

	return &ret
}

func MakeSlot(a, b string) Slot {
	return Slot{Key: SlotKey{Key: a}, Value: SlotValue{Type: b}}
}

func FillBusiness(conf *config.Configuration) Slot {
	val := SlotValue{Type: "frame"}
	addr := MakeSlot("Company Address", "string")
	addr.Value.StringValue = conf.Business.Address
	contact := MakeSlot("Company Contact Person", "string")
	contact.Value.StringValue = conf.Business.Contact
	email := MakeSlot("Company Email Address", "string")
	email.Value.StringValue = conf.Business.Email
	fax := MakeSlot("Company Fax Number", "string")
	fax.Value.StringValue = conf.Business.Fax
	id := MakeSlot("Company ID", "string")
	id.Value.StringValue = conf.Business.ID
	name := MakeSlot("Company Name", "string")
	name.Value.StringValue = conf.Business.Name
	tel := MakeSlot("Company Phone Number", "string")
	tel.Value.StringValue = conf.Business.Phone
	web := MakeSlot("Company Website URL", "string")
	web.Value.StringValue = conf.Business.Web
	ctax := MakeSlot("Default Customer TaxTable", "guid")
	ctax.Value.StringValue = "?qܳ?"
	inv := MakeSlot("Default Invoice Report", "string")
	inv.Value.StringValue = "Printable Invoice"
	timeout := MakeSlot("Default Invoice Report Timeout", "double")
	timeout.Value.StringValue = "0"
	vtax := MakeSlot("Default Vendor TaxTable", "guid")
	vtax.Value.StringValue = "?qܳ?"
	val.AnonymousValue = []any{addr, contact, email, fax, id, name, tel, web, ctax, inv, timeout, vtax}
	return Slot{Key: SlotKey{Key: "Business"}, Value: val}
}

func FillTax(conf *config.Configuration) Slot {
	val := SlotValue{Type: "frame"}
	nbr := MakeSlot("Tax Number", "string")
	nbr.Value.StringValue = conf.Business.TaxNum
	val.AnonymousValue = []any{nbr}
	return Slot{Key: SlotKey{Key: "Tax"}, Value: val}
}

func NewCommodityItem(space, value string) CommodityItem {
	name := xml.Name{Local: "cmdty:" + space}
	return CommodityItem{XMLName: name, Value: value}
}

func mapAccounts(conf *config.Configuration) []any {
	return makeAccount([]any{}, "RootAccount", "ROOT", "", false, conf.Accounts)
}

func mapAccount(mapped []any, acc config.Account, parent string) []any {
	return makeAccount(mapped, acc.Name, acc.Type, parent, acc.Placeholder, acc.Accounts)
}

func makeAccount(mapped []any, called, ofType, parent string, placeholder bool, accts []config.Account) []any {
	name := NewAccountItem("name", called)
	guid := newGuid()
	id := NewAccountItem("id", guid)
	id.Type = "guid"
	ty := NewAccountItem("type", ofType)
	curr := NewAccountItem("commodity", "")
	space := NewCommodityItem("space", "CURRENCY")
	currid := NewCommodityItem("id", "GBP")
	curr.Elements = []any{space, currid}
	scu := NewAccountItem("commodity-scu", "100")
	acct := Account{Version: "2.0.0", Elements: []any{name, id, ty, curr, scu}}

	if parent != "" {
		desc := NewAccountItem("description", called)
		acct.Elements = append(acct.Elements, desc)
	}

	if placeholder {
		plac := NewAccountItem("slots", "")
		ps := MakeSlot("placeholder", "string")
		ps.Value.StringValue = "true"
		plac.Elements = []any{ps}
		acct.Elements = append(acct.Elements, plac)
	}

	if parent != "" {
		parElt := NewAccountItem("parent", parent)
		parElt.Type = "guid"
		acct.Elements = append(acct.Elements, parElt)
	}

	mapped = append(mapped, acct)
	for _, a := range accts {
		mapped = mapAccount(mapped, a, guid)
	}

	return mapped
}

func NewAccountItem(tag, value string) AccountItem {
	name := xml.Name{Local: "act:" + tag}
	return AccountItem{XMLName: name, Value: value}
}

func newGuid() string {
	return strings.Replace(uuid.New().String(), "-", "", -1)
}
