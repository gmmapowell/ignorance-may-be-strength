package server

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

type FileHandler struct {
	file      string
	mediatype string
}

func (r *FileHandler) ServeHTTP(resp http.ResponseWriter, req *http.Request) {
	resp.Header().Set("Content-Type", r.mediatype)
	info, err := os.Stat(r.file)
	if err != nil {
		log.Printf("could not serve %s\n", r.file)
		return
	}
	resp.Header().Set("Content-Length", fmt.Sprintf("%d", info.Size()))
	stream, err := os.Open(r.file)
	if err != nil {
		log.Printf("could not serve %s\n", r.file)
		return
	}
	defer stream.Close()

	_, err = io.Copy(resp, stream)
	if err != nil {
		log.Printf("error streaming %s\n", r.file)
		return
	}
}

func NewFileHandler(file, mediatype string) http.Handler {
	return &FileHandler{file: file, mediatype: mediatype}
}
