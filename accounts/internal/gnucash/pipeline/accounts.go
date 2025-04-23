package pipeline

import (
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/accounts"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/sheets"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/writer"
)

func AccountsPipeline(conf *config.Configuration) {
	writer := writer.MakeWriter(conf.Output)
	accts := accounts.MakeAccounts(writer)
	sheets.ReadSpreadsheet(conf.Spreadsheet, accts)
}
