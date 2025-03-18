package compiler

type Action interface {
}

type BaseAction struct {
	ActionName string
	LineNo     int
}

type AssignAction struct {
	BaseAction
	Dest   string
	Append []string
}

type EnableAction struct {
	BaseAction
	Tiles []string
}

type DisableAction struct {
	BaseAction
	Tiles []string
}

type ClearAction struct {
	BaseAction
	Vars []string
}

type SubmitAction struct {
	BaseAction
	Var string
}

type StyleAction struct {
	BaseAction
	Styles []string
}
