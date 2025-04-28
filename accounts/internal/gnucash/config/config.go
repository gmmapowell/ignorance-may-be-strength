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
}

func (c *Configuration) RedirectURI() string {
	return fmt.Sprintf("http://localhost:%d/redirect_uri", c.RedirectPort)
}

func (c *Configuration) ListenOn() string {
	return fmt.Sprintf(":%d", c.RedirectPort)
}
