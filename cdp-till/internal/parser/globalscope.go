package parser

import "github.com/gmmapowell/ignorance/cdp-till/internal/compiler"

type GlobalScope struct {
	repo compiler.Repository
}

func (gs *GlobalScope) PresentTokens(lineNo int, tokens []string) Scope {
	switch tokens[0] {
	case "layout":
		return &LayoutScope{repo: gs.repo, hdrLine: lineNo, name: tokens[1]}
	case "init":
		return &MethodScope{repo: gs.repo, hdrLine: lineNo, entrytype: "method", name: "init"}
	case "button":
		return &MethodScope{repo: gs.repo, hdrLine: lineNo, entrytype: "button", name: tokens[1]}
	default:
		panic("cannot handle global command" + tokens[0])
	}
}

func (gs *GlobalScope) Close() {
	panic("you should not close the global scope")
}

func NewGlobalScope(repo compiler.Repository) Scope {
	return &GlobalScope{repo: repo}
}
