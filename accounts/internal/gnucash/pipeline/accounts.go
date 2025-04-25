package pipeline

import (
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/writer"
)

func AccountsPipeline(conf *config.Configuration) {
	w := writer.MakeWriter(conf)
	accts := writer.NewAccounts()
	w.Deliver(accts)
	// accts := accounts.MakeAccounts(conf, writer)
	// sheets.ReadSpreadsheet(conf, accts)
}
