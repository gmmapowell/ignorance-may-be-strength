package main

import (
	"fmt"
	"log"
	"os"
	"plugin"
)

func main() {
	hasHelp := false
	noMod := false
	invalidArg := false
	modules := make([]string, 0)
	i := 1
	for i < len(os.Args) {
		switch os.Args[i] {
		case "--help":
			if hasHelp {
				fmt.Println("can only specify --help once")
				return
			}
			hasHelp = true
		case "--module":
			fallthrough
		case "-m":
			i++
			if i < len(os.Args) {
				modules = append(modules, os.Args[i])
			} else {
				noMod = true
			}
		default:
			invalidArg = true
		}
		i++
	}
	if !hasHelp || noMod || invalidArg {
		fmt.Println("Usage: app --help [-m module]")
		return
	}
	for _, m := range modules {
		log.Printf("have module %s\n", m)

		p, err := plugin.Open(m + "/plugin.so")
		if err != nil {
			panic(err)
		}
		init, err := p.Lookup("ExportMe")
		if err != nil {
			panic(err)
		}
		log.Printf("have ExportMe function %v", init)
	}
}
