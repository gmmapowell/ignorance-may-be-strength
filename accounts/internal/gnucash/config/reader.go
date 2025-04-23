package config

import (
	"encoding/json"
	"log"
	"os"
)

func ReadConfig(file string) (*Configuration, error) {
	log.Printf("reading %s\n", file)
	bs, err := os.ReadFile(file)
	if err != nil {
		return nil, err
	}
	ret := Configuration{}
	json.Unmarshal(bs, &ret)
	log.Printf("read %v\n", ret)
	return &ret, nil
}
