package sheets

type Tab struct {
}

type Receiver interface {
	DeliverSheet(tabs []Tab)
}
