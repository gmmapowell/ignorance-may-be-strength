package parser

import "github.com/gmmapowell/ignorance/cdp-till/internal/compiler"

func Parse(repo compiler.Repository, srcdir string) {
	scope := NewGlobalScope(repo)
	lineLexicator := NewLineLexicator()
	blocker := NewBlocker(scope, lineLexicator)
	splitter := NewSplitter(blocker)
	scanner := NewScanner(splitter)
	scanner.ScanFilesInDirectory(srcdir)
}
