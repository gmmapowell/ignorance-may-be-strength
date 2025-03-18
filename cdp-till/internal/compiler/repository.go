package compiler

import (
	"encoding/json"
	"log"
	"maps"
	"slices"
)

type Repository interface {
	Clean()
	Layout(lineNo int, name string, rows []RowInfo)
	Method(lineNo int, name string, actions []Action)
	Json() []byte
}

type Entry interface {
}

type BaseEntry struct {
	EntryType string
	LineNo    int
	Name      string
}

type LayoutEntry struct {
	BaseEntry
	Rows []RowInfo
}

type MethodEntry struct {
	BaseEntry
	Actions []Action
}

type RepositoryStore struct {
	entries map[string]Entry
}

func (r *RepositoryStore) Clean() {
	clear(r.entries)
}

func (r *RepositoryStore) Layout(lineNo int, name string, rows []RowInfo) {
	_, ok := r.entries[name]
	if ok {
		panic("duplicate name: " + name)
	}
	r.entries[name] = LayoutEntry{BaseEntry: BaseEntry{EntryType: "layout", LineNo: lineNo, Name: name}, Rows: rows}
}

func (r *RepositoryStore) Method(lineNo int, name string, actions []Action) {
	_, ok := r.entries[name]
	if ok {
		panic("duplicate name: " + name)
	}
	r.entries[name] = MethodEntry{BaseEntry: BaseEntry{EntryType: "method", LineNo: lineNo, Name: name}, Actions: actions}
}

func (r *RepositoryStore) Json() []byte {
	bs, err := json.Marshal(slices.Collect(maps.Values(r.entries)))
	if err != nil {
		log.Printf("Error %v\n", err)
		return nil
	} else {
		return bs
	}
}

func NewRepository() Repository {
	return &RepositoryStore{entries: make(map[string]Entry)}
}
