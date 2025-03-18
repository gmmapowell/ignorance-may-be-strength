package generator

import (
	"github.com/gmmapowell/ignorance/cdp-till/internal/compiler"
	"github.com/gmmapowell/ignorance/cdp-till/internal/parser"
	"github.com/gmmapowell/ignorance/cdp-till/internal/watcher"
)

type Compiler interface {
	watcher.FileChanged
}

type CodeGenerator struct {
	repo     compiler.Repository
	srcdir   string
	reloader watcher.FileChanged
}

func (c *CodeGenerator) Changed(file string) {
	c.repo.Clean()
	parser.Parse(c.repo, c.srcdir)
	c.reloader.Changed(file)
}

func NewCompiler(repo compiler.Repository, srcdir string, reloader watcher.FileChanged) Compiler {
	ret := &CodeGenerator{repo: repo, srcdir: srcdir, reloader: reloader}
	ret.Changed("")
	return ret
}
