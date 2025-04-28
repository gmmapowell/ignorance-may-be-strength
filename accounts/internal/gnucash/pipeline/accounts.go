package pipeline

import (
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/writer"
)

func AccountsPipeline(conf *config.Configuration) {
	w := writer.MakeWriter(conf)
	// TODO: these two lines skip reading the spreadsheet
	accts := writer.NewAccounts(conf)
	accts.Transact(writer.Date(2021, 10, 29, 1059), "Income", "Checking Account", writer.GBP(1))
	accts.Transact(writer.Date(2020, 12, 31, 1059), "Income", "Checking Account", writer.GBP(8624))
	w.Deliver(accts)
	// accts := accounts.MakeAccounts(conf, writer)
	// sheets.ReadSpreadsheet(conf, accts)
}
