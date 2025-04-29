package accounts

import (
	"fmt"
	"strings"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/sheets"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/writer"
)

type AccountsTransformer struct {
	conf  *config.Configuration
	dlvr  writer.DeliverTo
	accts *writer.Gnucash
}

func (at *AccountsTransformer) DeliverSheet(tabs []sheets.Tab) {
	accts := writer.NewAccounts(at.conf)
	for _, tab := range tabs {
		verb := at.conf.VerbMap[tab.Title]
		if verb == nil {
			panic("there is no verb " + tab.Title)
		}
		for _, r := range tab.Rows {
			dt := r.Columns["Date"]
			var yr, mon, day int
			fmt.Sscanf(dt.(string), "%04d-%02d-%02d", &yr, &mon, &day)

			amount := r.Columns["Value"].(string)
			var amt writer.Money
			amount = strings.Replace(amount, "£", "", -1)
			amount = strings.Replace(amount, ",", "", -1)
			if strings.Contains(amount, ".") {
				var gbp, pence int
				fmt.Sscanf(amount, "%d.%d", &gbp, &pence)
				amt = writer.GBPP(gbp, pence)
			} else {
				var gbp int
				fmt.Sscanf(amount, "%d", &gbp)
				amt = writer.GBP(gbp)
			}

			tx := accts.Verb(verb, writer.Date(yr, mon, day, 900), r.Columns["Description"].(string), amt)
			if r.Columns["Source"] != nil && r.Columns["Source"] != "" {
				tx.SetSrc(r.Columns["Source"].(string))
			}
			if r.Columns["Dest"] != nil && r.Columns["Dest"] != "" {
				tx.SetDest(r.Columns["Dest"].(string))
			}
		}
	}
	at.accts = accts
	at.dlvr.Deliver(accts)
}

func (at *AccountsTransformer) Regurgitate(rcvr writer.TxReceiver) {
	at.accts.Regurgitate(rcvr)
}

func MakeAccounts(conf *config.Configuration, dlvr writer.DeliverTo) *AccountsTransformer {
	return &AccountsTransformer{conf: conf, dlvr: dlvr}
}
