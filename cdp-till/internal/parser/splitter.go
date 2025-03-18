package parser

import (
	"bufio"
	"fmt"
	"os"
)

type LineHandler interface {
	BeginFile(file string)
	ProcessLine(lineNo int, line string)
	EndFile(file string)
}

type Splitter struct {
	handler LineHandler
}

func (s *Splitter) ProcessFile(file string) {
	stream, err := os.Open(file)
	if err != nil {
		panic(fmt.Sprintf("could not process %s: %v", file, err))
	}
	defer stream.Close()

	s.handler.BeginFile(file)
	scanner := bufio.NewScanner(stream)
	i := 1
	for scanner.Scan() {
		text := scanner.Text()
		s.handler.ProcessLine(i, text)
		i++
	}
	s.handler.EndFile(file)
}

func NewSplitter(handler LineHandler) *Splitter {
	return &Splitter{handler: handler}
}
