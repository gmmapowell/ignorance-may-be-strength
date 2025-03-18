package parser

type Scope interface {
}

type LineLexer interface {
}

type Blocker struct {
	globalScope Scope
}

func (b *Blocker) ProcessLine(line string) {

}

func NewBlocker(scope Scope, lineLexicator LineLexer) *Blocker {
	return &Blocker{globalScope: scope}
}
