package config

import "github.com/gmmapowell/ignorance/accounts/internal/ct600/ixbrl"

type GnuCashAccountsIXBRLGenerator struct {
	config *Configuration
}

// Generate implements AccountsGenerator.
func (g *GnuCashAccountsIXBRLGenerator) Generate() *ixbrl.IXBRL {
	ret := ixbrl.NewIXBRL(g.config.Business.Name+" - Financial Statements", "https://xbrl.frc.org.uk/FRS-102/2025-01-01/FRS-102-2025-01-01.xsd")
	ret.AddSchema("bus", "http://xbrl.frc.org.uk/cd/2025-01-01/business")
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:NameProductionSoftware", Text: "Ziniki HMRC"})
	return ret
}
