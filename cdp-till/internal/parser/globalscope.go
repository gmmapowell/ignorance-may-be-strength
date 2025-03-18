package parser

import "github.com/gmmapowell/ignorance/cdp-till/internal/compiler"

type GlobalScope struct {
	repo compiler.Repository
}

func (gs *GlobalScope) PresentTokens(tokens []string) Scope {
	return &GlobalScope{}
}

func (gs *GlobalScope) Close() {

}

func NewGlobalScope(repo compiler.Repository) Scope {
	return &GlobalScope{repo: repo}
}
