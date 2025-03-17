package main

import (
	"github.com/gmmapowell/ignorance/cdp-till/internal/chrome"
	"github.com/gmmapowell/ignorance/cdp-till/internal/watcher"
	server "github.com/gmmapowell/ignorance/cdp-till/internal/web"
)

const port = "1399"

func main() {
	reloader := chrome.NewReloader("http://localhost:"+port+"/", "http://localhost:9222")
	go watcher.Watch("website", reloader)
	server.StartServer(":" + port)
}
