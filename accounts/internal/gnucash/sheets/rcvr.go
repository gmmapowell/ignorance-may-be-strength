package sheets

type Row struct {
	Columns map[string]any
}

type Tab struct {
	Rows []Row
}

type Receiver interface {
	DeliverSheet(tabs []Tab)
}
