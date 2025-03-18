package compiler

type Action interface {
}

type AssignAction struct {
	LineNo int
	Dest   string
	Append []string
}

type EnableAction struct {
	LineNo int
	Tiles  []string
}

type DisableAction struct {
	LineNo int
	Tiles  []string
}

type ClearAction struct {
	LineNo int
	Vars   []string
}

type SubmitAction struct {
	LineNo int
	Var    string
}

type StyleAction struct {
	LineNo int
	Styles []string
}
