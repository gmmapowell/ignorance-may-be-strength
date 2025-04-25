package writer

type DeliverTo interface {
	Deliver(accts *Gnucash)
}
