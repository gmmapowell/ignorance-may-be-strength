package config

import "fmt"

type Configuration struct {
	APIKey       string
	OAuth        string
	Token        string
	RedirectPort int
	Spreadsheet  string
	Output       string

	Business Business
	Ranges   map[string]DateRange
	Accounts []Account
	Verbs    []Verb
	VerbMap  map[string]*Verb
}

type Business struct {
	Address string
	Contact string
	Email   string
	Fax     string
	ID      string
	Name    string
	Phone   string
	TaxNum  string
	Web     string

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

type Verb struct {
	Name   string
	Source string
	Dest   string
}

func MakeConfiguration() Configuration {
	return Configuration{VerbMap: make(map[string]*Verb)}
}

func (c *Configuration) RedirectURI() string {
	return fmt.Sprintf("http://localhost:%d/redirect_uri", c.RedirectPort)
}

func (c *Configuration) ListenOn() string {
	return fmt.Sprintf(":%d", c.RedirectPort)
}

func (config *Configuration) AccountsGenerator() IXBRLGenerator {
	return &GnuCashAccountsIXBRLGenerator{config: config}
}

func (config *Configuration) ComputationsGenerator(utr string) IXBRLGenerator {
	return &GnuCashComputationsIXBRLGenerator{config: config, utr: utr}
}
