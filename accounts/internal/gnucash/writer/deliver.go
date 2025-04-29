package writer

type DeliverTo interface {
	Deliver(accts *Gnucash)
}

type TxReceiver interface {
	Credit(c AccountCredit)
	Debit(c AccountDebit)
}
