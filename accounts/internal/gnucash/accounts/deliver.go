package accounts

type Gnucash struct {
}

type DeliverTo interface {
	Deliver(accts Gnucash)
}
