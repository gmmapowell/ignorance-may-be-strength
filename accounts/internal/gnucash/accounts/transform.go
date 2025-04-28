package accounts

import (
	"fmt"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/sheets"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/writer"
)

type AccountsTransformer struct {
	conf *config.Configuration
	dlvr writer.DeliverTo
}

func (at *AccountsTransformer) DeliverSheet(tabs []sheets.Tab) {
	fmt.Printf("%v\n", tabs)
	accts := writer.NewAccounts(at.conf)
	at.dlvr.Deliver(accts)
}

func MakeAccounts(conf *config.Configuration, dlvr writer.DeliverTo) *AccountsTransformer {
	return &AccountsTransformer{conf: conf, dlvr: dlvr}
}
