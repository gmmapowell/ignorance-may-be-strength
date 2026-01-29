package config

import "github.com/gmmapowell/ignorance/accounts/internal/ct600/ixbrl"

type GnuCashAccountsIXBRLGenerator struct {
	config *Configuration
}

// Generate implements AccountsGenerator.
func (g GnuCashAccountsIXBRLGenerator) Generate() *ixbrl.IXBRL {
	return ixbrl.NewIXBRL()
}
