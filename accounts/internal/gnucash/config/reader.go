package config

import (
	"encoding/json"
	"os"
)

func ReadConfig(file string) (*Configuration, error) {
	ret := MakeConfiguration()
	err := ReadAConfiguration(ret, file)
	if err != nil {
		return nil, err
	} else {
		return ret, nil
	}
}

func ReadAConfiguration(config *Configuration, file string) error {
	bs, err := os.ReadFile(file)
	if err != nil {
		return err
	}
	err = json.Unmarshal(bs, config)
	if err != nil {
		panic(err)
	}
	for _, v := range config.Verbs {
		config.VerbMap[v.Name] = &v
	}
	return nil
}
