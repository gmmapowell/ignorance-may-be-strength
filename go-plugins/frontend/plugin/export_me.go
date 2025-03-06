package main

import "gmmapowell.com/app/pkg/api"

type FrontEnd struct {
}

func ExportMe() api.PluginTopLevel {
	return &FrontEnd{}
}

func (db *FrontEnd) Methods() []api.PluginMethod {
	return []api.PluginMethod{&BrowseMethod{}, &QuitMethod{}}
}

type BrowseMethod struct{}

func (m *BrowseMethod) Help() string {
	return "  browse - open brower"
}

type QuitMethod struct{}

func (m *QuitMethod) Help() string {
	return "  quit - quit brower"
}
