package parser

import "github.com/gmmapowell/ignorance/cdp-till/internal/compiler"

type MethodScope struct {
	repo    compiler.Repository
	hdrLine int
	name    string
	actions []compiler.Action
}

func (s *MethodScope) PresentTokens(lineNo int, tokens []string) Scope {
	if tokens[1] == "<-" {
		s.actions = append(s.actions, compiler.AssignAction{BaseAction: compiler.BaseAction{ActionName: "assign", LineNo: lineNo}, Dest: tokens[0], Append: tokens[2:]})
		return &InvalidScope{}
	}
	bs := compiler.BaseAction{ActionName: tokens[0], LineNo: lineNo}
	switch tokens[0] {
	case "clear":
		s.actions = append(s.actions, compiler.ClearAction{BaseAction: bs, Vars: tokens[1:]})
		return &InvalidScope{}

	case "disable":
		s.actions = append(s.actions, compiler.DisableAction{BaseAction: bs, Tiles: tokens[1:]})
		return &InvalidScope{}
	case "enable":
		s.actions = append(s.actions, compiler.EnableAction{BaseAction: bs, Tiles: tokens[1:]})
		return &InvalidScope{}

	case "submit":
		s.actions = append(s.actions, compiler.SubmitAction{BaseAction: bs, Var: tokens[1]})
		return &InvalidScope{}

	case "style":
		s.actions = append(s.actions, compiler.StyleAction{BaseAction: bs, Styles: tokens[1:]})
		return &InvalidScope{}
	}
	panic("method cannot handle " + tokens[0])
}

func (s *MethodScope) Close() {
	s.repo.Method(s.hdrLine, s.name, s.actions)
}
