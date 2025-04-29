package config

import (
	"encoding/json"
	"os"
)

func ReadConfig(file string) (*Configuration, error) {
	bs, err := os.ReadFile(file)
	if err != nil {
		return nil, err
	}
	ret := Configuration{VerbMap: make(map[string]*Verb)}
	err = json.Unmarshal(bs, &ret)
	if err != nil {
		panic(err)
	}
	for _, v := range ret.Verbs {
		ret.VerbMap[v.Name] = &v
	}
	return &ret, nil
}
