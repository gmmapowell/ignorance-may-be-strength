package parser

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type FileHandler interface {
	ProcessFile(file string)
}

type Scanner struct {
	handler FileHandler
}

func (s *Scanner) ScanFilesInDirectory(srcdir string) {
	s.scanFor(srcdir, ".till")
}

func (s *Scanner) scanFor(srcdir, suffix string) {
	files, err := os.ReadDir(srcdir)
	if err != nil {
		panic(fmt.Sprintf("could not read src directory %s: %v", srcdir, err))
	}
	for _, f := range files {
		if !f.IsDir() && strings.HasSuffix(f.Name(), suffix) {
			s.handler.ProcessFile(filepath.Join(srcdir, f.Name()))
		}
	}
}

func NewScanner(handler FileHandler) *Scanner {
	return &Scanner{handler: handler}
}
