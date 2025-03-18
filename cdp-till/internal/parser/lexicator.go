package parser

type LineLexicator struct {
}

func (l *LineLexicator) Lexicate(line string) []string {
	return make([]string, 0)
}

func NewLineLexicator() *LineLexicator {
	return &LineLexicator{}
}
