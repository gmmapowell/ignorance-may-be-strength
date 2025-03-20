package server

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gmmapowell/ignorance/cdp-till/internal/compiler"
)

func StartServer(addr string, repo compiler.Repository) {
	handlers := http.NewServeMux()
	index := NewFileHandler("website/index.html", "text/html")
	handlers.Handle("/{$}", index)
	handlers.Handle("/index.html", index)
	favicon := NewFileHandler("website/favicon.ico", "image/x-icon")
	handlers.Handle("/favicon.ico", favicon)
	cssHandler := NewDirHandler("website/css", "text/css")
	handlers.Handle("/css/{resource}", cssHandler)
	jsHandler := NewDirHandler("website/js", "text/javascript")
	handlers.Handle("/js/{resource}", jsHandler)
	repoHandler := NewRepoHandler(repo, "application/json")
	handlers.Handle("/till-code", repoHandler)
	orderHandler := NewOrderHandler()
	handlers.Handle("/order", orderHandler)
	srcHandler := NewDirHandler("samples", "text/plain")
	handlers.Handle("/src/{resource}", srcHandler)
	server := &http.Server{Addr: addr, Handler: handlers}
	err := server.ListenAndServe()
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		fmt.Printf("error starting server: %s\n", err)
	}
}
