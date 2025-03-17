package watcher

import (
	"log"

	"github.com/fsnotify/fsnotify"
)

type FileChanged interface {
	Changed(file string)
}

func Watch(dir string, handler FileChanged) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Printf("could not launch a watcher, you're on your own")
		return
	}
	defer watcher.Close()

	watcher.Add(dir)

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			if event.Has(fsnotify.Write) {
				handler.Changed(event.Name)
			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("error:", err)
		}
	}
}
