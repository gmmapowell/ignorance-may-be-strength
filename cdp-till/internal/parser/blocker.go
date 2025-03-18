package parser

type Scope interface {
}

type LineLexer interface {
}

type Blocker struct {
	globalScope Scope
}

func (b *Blocker) BeginFile(file string) {

}

func (b *Blocker) ProcessLine(lineNo int, line string) {

}

func (b *Blocker) EndFile(file string) {

}

func NewBlocker(scope Scope, lineLexicator LineLexer) *Blocker {
	return &Blocker{globalScope: scope}
}
