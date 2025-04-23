package accounts

import "github.com/gmmapowell/ignorance/accounts/internal/gnucash/sheets"

type AccountsTransformer struct {
}

func (at *AccountsTransformer) DeliverSheet(tabs []sheets.Tab) {
	panic("unimplemented")
}

func MakeAccounts(dlvr DeliverTo) *AccountsTransformer {
	return &AccountsTransformer{}
}
