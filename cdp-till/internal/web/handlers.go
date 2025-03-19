package server

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gmmapowell/ignorance/cdp-till/internal/compiler"
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

type RepoHandler struct {
	repo      compiler.Repository
	mediatype string
}

func (r *RepoHandler) ServeHTTP(resp http.ResponseWriter, req *http.Request) {
	bs := r.repo.Json()
	resp.Header().Set("Content-Type", r.mediatype)
	resp.Header().Set("Content-Length", fmt.Sprintf("%d", len(bs)))
	resp.Header().Set("Access-Control-Allow-Origin", "*")
	resp.Write(bs)
}

type OrderHandler struct {
}

func (r *OrderHandler) ServeHTTP(resp http.ResponseWriter, req *http.Request) {
	body, err := io.ReadAll(req.Body)
	if err != nil {
		panic(err)
	}
	var order []string
	err = json.Unmarshal(body, &order)
	if err != nil {
		panic(err)
	}
	fmt.Println(" --- NEW ORDER ---")
	for _, item := range order {
		fmt.Printf("   %s\n", item)
	}
}

func NewFileHandler(file, mediatype string) http.Handler {
	return &FileHandler{file: file, mediatype: mediatype}
}

func NewDirHandler(dir, mediatype string) http.Handler {
	return &DirHandler{dir: dir, mediatype: mediatype}
}

func NewRepoHandler(repo compiler.Repository, mediatype string) http.Handler {
	return &RepoHandler{repo: repo, mediatype: mediatype}
}

func NewOrderHandler() http.Handler {
	return &OrderHandler{}
}
