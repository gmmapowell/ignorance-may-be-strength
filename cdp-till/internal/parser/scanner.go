package parser

type FileHandler interface {
	ProcessFile(file string)
}

type Scanner struct {
	handler FileHandler
}

func (s *Scanner) ScanFilesInDirectory(srcdir string) {

}

func NewScanner(handler FileHandler) *Scanner {
	return &Scanner{handler: handler}
}
