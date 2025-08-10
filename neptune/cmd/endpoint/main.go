package main

import (
	"log"
	"os"

	"github.com/gmmapowell/ignorance/neptune/internal/neptune"
)

func main() {
	if len(os.Args) < 3 {
		log.Printf("Usage: endpoint c <user> <connId>")
		log.Printf(" or    endpoint d <connId>")
		return
	}
	command := os.Args[1]
	svc, err := neptune.OpenNeptune("user-stocks")
	if err != nil {
		panic(err)
	}
	switch command {
	case "c":
		if len(os.Args) != 4 {
			log.Printf("Usage: endpoint c <user> <connId>")
			return
		}
		watcher := os.Args[2]
		connId := os.Args[3]
		err = neptune.ConnectEndpoint(svc, watcher, connId)
	case "d":
		connId := os.Args[2]
		err = neptune.DisconnectEndpoint(svc, connId)
	default:
		log.Printf("Usage: the command must be 'c' or 'd'")
		return
	}
	if err != nil {
		panic(err)
	}
}
