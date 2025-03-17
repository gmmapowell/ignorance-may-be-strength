package main

import (
	"fmt"
	"os"

	server "github.com/gmmapowell/ignorance/cdp-till/internal/web"
)

func main() {
	wd, _ := os.Getwd()
	fmt.Println("Working Directory:", wd)
	server.StartServer()
}
