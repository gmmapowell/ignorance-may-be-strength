package api

type PluginTopLevel interface {
	Methods() []PluginMethod
}

type PluginMethod interface {
	Help() string
}
