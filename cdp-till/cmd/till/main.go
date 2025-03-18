package main

import (
	"github.com/gmmapowell/ignorance/cdp-till/internal/chrome"
	"github.com/gmmapowell/ignorance/cdp-till/internal/compiler"
	"github.com/gmmapowell/ignorance/cdp-till/internal/generator"
	"github.com/gmmapowell/ignorance/cdp-till/internal/watcher"
	server "github.com/gmmapowell/ignorance/cdp-till/internal/web"
)

const port = "1399"

func main() {
	reloader := chrome.NewReloader("http://localhost:"+port+"/", "http://localhost:9222")
	go watcher.Watch("website", reloader)
	repo := compiler.NewRepository()
	recompile := generator.NewCompiler(repo, "samples", reloader)
	go watcher.Watch("samples", recompile)
	server.StartServer(":"+port, repo)
}
