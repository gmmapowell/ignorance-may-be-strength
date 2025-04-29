package reporter

import (
	"fmt"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/writer"
)

type reporter struct {
	Accounts map[string]account
	Year     int
}

func (r *reporter) Configure(accts []config.Account) {
	for _, acc := range accts {
		// log.Printf("Configuring %s of %s\n", acc.Name, acc.Type)
		r.Accounts[acc.Name] = makeAccount(r.Year, acc.Type)
		r.Configure(acc.Accounts)
	}
}

func (r *reporter) Credit(c writer.AccountCredit) {
	// fmt.Printf("%s: Credit %s with %s\n", c.When.JustDate(), c.Acct, c.Amount)
	r.Accounts[c.Acct].Credit(c.When, c.Amount)
}

func (r *reporter) Debit(c writer.AccountDebit) {
	// fmt.Printf("%s: Debit %s by %s\n", c.When.JustDate(), c.Acct, c.Amount)
	r.Accounts[c.Acct].Debit(c.When, c.Amount)
}

func NewReporter(conf *config.Configuration, yr int) *reporter {
	ret := reporter{Year: yr, Accounts: make(map[string]account)}
	ret.Configure(conf.Accounts)
	return &ret
}

func (r *reporter) ProfitLoss(yr int) {
	fmt.Printf("Profit and Loss for %d\n", yr)
	var total writer.Money
	for name, acc := range r.Accounts {
		if acc.IsPL() && acc.HasBalance() {
			fmt.Printf("  %s: %s\n", name, acc.Balance())
			total.Incorporate(acc.PLEffect(), acc.Balance())
		}
	}
	fmt.Printf("Net Profit/Loss: %s\n", total)
}

func (r *reporter) BalanceSheet(yr int) {
	fmt.Printf("Balance Sheet at %d-12-31\n", yr)
	for name, acc := range r.Accounts {
		if !acc.IsPL() && acc.HasBalance() {
			fmt.Printf("  %s: %s\n", name, acc.Balance())
		}
	}
}
