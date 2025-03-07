package main

import "gmmapowell.com/app/pkg/api"

type Database struct {
}

func ExportMe() api.PluginTopLevel {
	return &Database{}
}

func (db *Database) Methods() []api.PluginMethod {
	return []api.PluginMethod{&InsertMethod{}, &QueryMethod{}}
}

type InsertMethod struct{}

func (m *InsertMethod) Help() string {
	return "  insert - insert data into database"
}

type QueryMethod struct{}

func (m *QueryMethod) Help() string {
	return "  query - interrogate the database"
}
