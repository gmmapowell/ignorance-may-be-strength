package reporter

import (
	"fmt"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/writer"
)

type reporter struct {
	Year int
}

func (r *reporter) Credit(c writer.AccountCredit) {
	fmt.Printf("%s: Credit %s with %s\n", c.When.JustDate(), c.Acct, c.Amount.String())
}

func (r *reporter) Debit(c writer.AccountDebit) {
	fmt.Printf("%s: Debit %s by %s\n", c.When.JustDate(), c.Acct, c.Amount.String())
}

func NewReporter(yr int) writer.TxReceiver {
	return &reporter{Year: yr}
}
