package sheets

type Row struct {
	Columns map[string]any
}

type Tab struct {
	Title string
	Rows  []Row
}

type Receiver interface {
	DeliverSheet(tabs []Tab)
}
