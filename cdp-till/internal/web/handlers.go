package server

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

type FileHandler struct {
	file      string
	mediatype string
}

type DirHandler struct {
	dir       string
	mediatype string
}

func (r *FileHandler) ServeHTTP(resp http.ResponseWriter, req *http.Request) {
	sendFile(resp, r.mediatype, r.file)
}

func (r *DirHandler) ServeHTTP(resp http.ResponseWriter, req *http.Request) {
	rsc := req.PathValue("resource")
	sendFile(resp, r.mediatype, filepath.Join(r.dir, rsc))
}

func sendFile(resp http.ResponseWriter, mediatype, path string) {
	resp.Header().Set("Content-Type", mediatype)
	info, err := os.Stat(path)
	if err != nil {
		log.Printf("could not serve %s\n", path)
		return
	}
	resp.Header().Set("Content-Length", fmt.Sprintf("%d", info.Size()))
	stream, err := os.Open(path)
	if err != nil {
		log.Printf("could not serve %s\n", path)
		return
	}
	defer stream.Close()

	_, err = io.Copy(resp, stream)
	if err != nil {
		log.Printf("error streaming %s\n", path)
		return
	}
}

func NewFileHandler(file, mediatype string) http.Handler {
	return &FileHandler{file: file, mediatype: mediatype}
}

func NewDirHandler(dir, mediatype string) http.Handler {
	return &DirHandler{dir: dir, mediatype: mediatype}
}
