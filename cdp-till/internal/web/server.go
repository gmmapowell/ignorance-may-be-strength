package server

import (
	"errors"
	"fmt"
	"net/http"
)

func StartServer(addr string) {
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
	server := &http.Server{Addr: addr, Handler: handlers}
	err := server.ListenAndServe()
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		fmt.Printf("error starting server: %s\n", err)
	}
}
