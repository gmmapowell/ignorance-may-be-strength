package parser

import (
	"fmt"
	"path/filepath"
	"unicode"
)

type Scope interface {
	PresentTokens([]string) Scope
	Close()
}

type LineLexer interface {
	Lexicate(line string) []string
}

type Blocker struct {
	lineLexer LineLexer
	scopes    []Scope
}

func (b *Blocker) BeginFile(file string) {
	fmt.Printf("%s:\n", filepath.Base(file))
}

func (b *Blocker) ProcessLine(lineNo int, line string) {
	indent, remaining := figureIndent(lineNo, line)
	if indent == 0 {
		return
	}

	b.closeScopes(indent)
	if indent > len(b.scopes)+1 {
		panic(fmt.Sprintf("double indent at line %d", lineNo))
	}

	tokens := b.lineLexer.Lexicate(remaining)
	inner := b.scopes[len(b.scopes)-1].PresentTokens(tokens)
	b.scopes = append(b.scopes, inner)
}

func (b *Blocker) EndFile(file string) {
	b.closeScopes(1)
}

func figureIndent(lineNo int, line string) (int, string) {
	if len(line) == 0 {
		// it's an empty line
		return 0, ""
	}

	runes := []rune(line)
	hasnontabs := false
	indent := -1
	for i, r := range runes {
		if unicode.IsSpace(r) {
			if r != '\t' {
				hasnontabs = true
			}
		} else {
			indent = i
			break
		}
	}
	if indent > 0 && hasnontabs {
		panic(fmt.Sprintf("line %d has non-tab characters in indent", lineNo))
	}
	if indent <= 0 {
		// it's blank or a comment
		return 0, ""
	}

	return indent, string(runes[indent:])
}

func (b *Blocker) closeScopes(upto int) {
	for len(b.scopes) > upto {
		b.scopes[len(b.scopes)-1].Close()
		b.scopes = b.scopes[:len(b.scopes)-1]
	}
}

func NewBlocker(scope Scope, lineLexicator LineLexer) *Blocker {
	scopes := append(make([]Scope, 0), scope)
	return &Blocker{scopes: scopes, lineLexer: lineLexicator}
}
