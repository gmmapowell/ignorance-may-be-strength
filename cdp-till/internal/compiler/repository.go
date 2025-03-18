package compiler

type Repository interface {
	Layout(lineNo int, name string, rows []RowInfo)
	Method(lineNo int, name string, actions []Action)
}

type Entry interface {
}

type LayoutEntry struct {
	lineNo int
	name   string
	rows   []RowInfo
}

type MethodEntry struct {
	lineNo  int
	name    string
	actions []Action
}

type RepositoryStore struct {
	entries map[string]Entry
}

func (r *RepositoryStore) Layout(lineNo int, name string, rows []RowInfo) {
	_, ok := r.entries[name]
	if ok {
		panic("duplicate name: " + name)
	}
	r.entries[name] = LayoutEntry{lineNo: lineNo, name: name, rows: rows}
}

func (r *RepositoryStore) Method(lineNo int, name string, actions []Action) {
	_, ok := r.entries[name]
	if ok {
		panic("duplicate name: " + name)
	}
	r.entries[name] = MethodEntry{lineNo: lineNo, name: name, actions: actions}
}

func NewRepository() Repository {
	return &RepositoryStore{entries: make(map[string]Entry)}
}
