package config

import "github.com/gmmapowell/ignorance/accounts/internal/ct600/ixbrl"

type AccountsGenerator interface {
	Generate() *ixbrl.IXBRL
}

type ComputationsGenerator interface {
}
