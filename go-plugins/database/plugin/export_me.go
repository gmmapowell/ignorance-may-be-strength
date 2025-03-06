package main

import "gmmapowell.com/app/pkg/api"

type Database struct {
}

func ExportMe() api.PluginTopLevel {
	return &Database{}
}

func (db *Database) Methods() []api.PluginMethod {
	return nil
}
