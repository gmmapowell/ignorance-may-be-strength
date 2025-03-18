package parser

type LineHandler interface {
	ProcessLine(line string)
}

type Splitter struct {
	handler LineHandler
}

func (s *Splitter) ProcessFile(file string) {

}

func NewSplitter(handler LineHandler) *Splitter {
	return &Splitter{handler: handler}
}
