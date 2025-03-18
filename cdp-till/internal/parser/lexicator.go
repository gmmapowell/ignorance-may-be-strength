package parser

import "unicode"

type LineLexicator struct {
}

func (l *LineLexicator) Lexicate(line string) []string {
	ol := &OneLine{}
	for _, r := range line {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || r == '_' {
			ol.completeAssign()
			ol.alpha(r)
		} else if r == '<' || r == '-' {
			ol.completeAlpha()
			ol.assign(r)
		} else if unicode.IsSpace(r) {
			ol.completeAlpha()
			ol.completeAssign()
		} else {
			panic("huh?")
		}
	}
	ol.completeAlpha()
	ol.completeAssign()
	return ol.ret
}

func NewLineLexicator() *LineLexicator {
	return &LineLexicator{}
}

type OneLine struct {
	curr              []rune
	ret               []string
	inAlpha, inAssign bool
}

func (ol *OneLine) alpha(r rune) {
	ol.inAlpha = true
	ol.curr = append(ol.curr, r)
}

func (ol *OneLine) assign(r rune) {
	ol.inAssign = true
	ol.curr = append(ol.curr, r)
}

func (ol *OneLine) completeAlpha() {
	if !ol.inAlpha {
		return
	}
	tok := string(ol.curr)
	ol.curr = nil
	ol.ret = append(ol.ret, tok)
	ol.inAlpha = false
}

func (ol *OneLine) completeAssign() {
	if !ol.inAssign {
		return
	}
	op := string(ol.curr)
	ol.curr = nil
	if op != "<-" {
		panic("invalid operator: " + op)
	}
	ol.ret = append(ol.ret, op)
	ol.inAssign = false
}
