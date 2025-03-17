package server

import (
	"errors"
	"fmt"
	"net/http"
)

func StartServer(addr string) {
	handlers := http.NewServeMux()
	index := NewFileHandler("website/index.html", "text/html")
	handlers.Handle("/", index)
	handlers.Handle("/index.html", index)
	server := &http.Server{Addr: addr, Handler: handlers}
	err := server.ListenAndServe()
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		fmt.Printf("error starting server: %s\n", err)
	}
}
