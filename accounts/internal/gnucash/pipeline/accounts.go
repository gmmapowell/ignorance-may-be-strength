package pipeline

import (
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/accounts"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/reporter"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/sheets"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/writer"
)

func AccountsPipeline(conf *config.Configuration) {
	w := writer.MakeWriter(conf)
	accts := accounts.MakeAccounts(conf, w)
	sheets.ReadSpreadsheet(conf, accts)

	for yr := 2019; yr <= 2019; yr++ {
		r := reporter.NewReporter(yr)
		accts.Regurgitate(r)
	}
}
