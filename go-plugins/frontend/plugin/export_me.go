package main

import "gmmapowell.com/app/pkg/api"

type FrontEnd struct {
}

func ExportMe() api.PluginTopLevel {
	return &FrontEnd{}
}

func (db *FrontEnd) Methods() []api.PluginMethod {
	return nil
}
