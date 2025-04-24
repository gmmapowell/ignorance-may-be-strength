package config

import "fmt"

type Configuration struct {
	APIKey       string
	OAuth        string
	Token        string
	RedirectPort int
	Spreadsheet  string
	Output       string
}

func (c *Configuration) RedirectURI() string {
	return fmt.Sprintf("http://localhost:%d/redirect_uri", c.RedirectPort)
}

func (c *Configuration) ListenOn() string {
	return fmt.Sprintf(":%d", c.RedirectPort)
}
