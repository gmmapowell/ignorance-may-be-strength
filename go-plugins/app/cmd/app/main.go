package main

import (
	"fmt"
	"os"
	"plugin"

	"slices"

	"gmmapowell.com/app/pkg/api"
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

	toplevels := make([]api.PluginTopLevel, 0)
	for _, m := range modules {
		p, err := plugin.Open(m + "/plugin.so")
		if err != nil {
			panic(err)
		}
		init, err := p.Lookup("ExportMe")
		if err != nil {
			panic(err)
		}
		tl := init.(func() api.PluginTopLevel)()
		toplevels = append(toplevels, tl)
	}

	texts := make([]string, 0)
	for _, tl := range toplevels {
		for _, meth := range tl.Methods() {
			h := meth.Help()
			texts = append(texts, h)
		}
	}

	slices.Sort(texts)

	for _, t := range texts {
		fmt.Println(t)
	}
}
