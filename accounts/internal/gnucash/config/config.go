package config

import (
	"fmt"
)

type Configuration struct {
	APIKey       string
	OAuth        string
	Token        string
	RedirectPort int
	Spreadsheet  string
	Output       string
	SubmitDir    string

	Debug        DebugOptions
	Business     Business
	Ranges       map[string]DateRange
	Accounts     []Account
	Verbs        []Verb
	VerbMap      map[string]*Verb
	Calculations []Calculation
	Pages        []PageDefn
	CompsPages   []PageDefn
	CT600        map[string]*CT600Entry

	// Fpr ct600
	Dest                     string
	GWTest                   *int
	TestInLive               *bool
	Sender, Password         string
	Utr                      string
	Vendor, Product, Version string

	// Arguments for Polling
	PollURI, CorrelationID string
}

type CT600Entry struct {
	Year string
	From string
}

type DebugOptions struct {
	GatherTabs bool
}

type Business struct {
	Address      string
	AvgEmployees int
	Contact      string
	Email        string
	Fax          string
	ID           string
	Name         string
	Phone        string
	TaxNum       string
	Web          string

	// TODO: what this?
	CompanyType string
}

type DateRange struct {
	Start string
	End   string
}

type Account struct {
	Name        string
	Type        string
	Placeholder bool
	Accounts    []Account
}

type ADate interface {
}

type MyMoney interface {
	fmt.Stringer
	NumberString() string
}

type ReporterAccount interface {
	Credit(date ADate, amount MyMoney)
	Debit(date ADate, amount MyMoney)
	Type() string
	HasBalance() bool
	Balance() MyMoney
	IsPL() bool
	PLEffect() int
	ShowBrackets() bool
}

type Verb struct {
	Name   string
	Source string
	Dest   string
}

type Calculation struct {
	AssignTo string
	Type     string
	Add      []string
	Subtract []string
	Floor    *float32
	Scale    *float32
}

type PageDefn struct {
	Title     string
	TitleArgs []ArgDefn
	Rows      []RowDefn
}

type ArgDefn struct {
	Year   string
	Scope  string
	Format string
}

type RowDefn struct {
	ElideIfAllZero bool
	Columns        []ColumnDefn
}

type ColumnDefn struct {
	Label string
	Date  string
	Value string
	GBP   string

	Unit       string
	Year       string
	Scope      string
	Context    string
	Tag        string
	DateFormat string
}

func MakeConfiguration() *Configuration {
	return &Configuration{VerbMap: make(map[string]*Verb)}
}

func (c *Configuration) RedirectURI() string {
	return fmt.Sprintf("http://localhost:%d/redirect_uri", c.RedirectPort)
}

func (c *Configuration) ListenOn() string {
	return fmt.Sprintf(":%d", c.RedirectPort)
}
