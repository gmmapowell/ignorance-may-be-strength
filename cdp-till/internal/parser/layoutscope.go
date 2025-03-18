package parser

import "github.com/gmmapowell/ignorance/cdp-till/internal/compiler"

type LayoutScope struct {
	repo    compiler.Repository
	hdrLine int
	name    string
	rows    []compiler.RowInfo
}

func (s *LayoutScope) PresentTokens(lineNo int, tokens []string) Scope {
	if tokens[1] == "<-" {
		s.rows = append(s.rows, compiler.RowInfo{LineNo: lineNo, Label: tokens[0], Tiles: tokens[2:]})
		return &InvalidScope{}
	} else {
		panic("layout cannot handle " + tokens[0])
	}
}

func (s *LayoutScope) Close() {
	s.repo.Layout(s.hdrLine, s.name, s.rows)
}
