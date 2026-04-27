package config

import (
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/ixbrl"
)

type IXBRLGenerator interface {
	Generate(acctranges map[string]map[string]ReporterAccount) *ixbrl.IXBRL
}

type ComputationsGenerator interface {
}
