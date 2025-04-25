package accounts

import (
	"fmt"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/sheets"
)

type AccountsTransformer struct {
}

func (at *AccountsTransformer) DeliverSheet(tabs []sheets.Tab) {
	fmt.Printf("%v\n", tabs)
}

func MakeAccounts(conf *config.Configuration, dlvr DeliverTo) *AccountsTransformer {
	return &AccountsTransformer{}
}
