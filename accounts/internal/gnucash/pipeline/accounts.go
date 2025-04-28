package pipeline

import (
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/writer"
)

func AccountsPipeline(conf *config.Configuration) {
	w := writer.MakeWriter(conf)
	// TODO: these two lines skip reading the spreadsheet
	accts := writer.NewAccounts(conf)
	verb := config.Verb{Source: "Income", Dest: "Checking Account"}
	accts.Verb(verb, writer.Date(2021, 10, 29, 1059), "desc", writer.GBP(1))
	custom := config.Verb{Source: "Income"}
	tx := accts.Verb(custom, writer.Date(2020, 12, 31, 1059), "whatevs", writer.GBP(8624))
	tx.SetDest("Director Loan Account - Gareth Powell")
	w.Deliver(accts)
	// accts := accounts.MakeAccounts(conf, writer)
	// sheets.ReadSpreadsheet(conf, accts)
}
