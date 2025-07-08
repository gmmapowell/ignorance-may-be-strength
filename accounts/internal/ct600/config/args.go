package config

import (
	"fmt"
)

const SUBMIT_MODE = "--submit"
const LIST_MODE = "--list"

func ParseArguments(args []string) (*Config, string, error) {
	mode := ""
	conf := MakeBlankConfig()
	for _, f := range args {
		switch f {
		case LIST_MODE:
			fallthrough
		case SUBMIT_MODE:
			if mode != "" {
				return nil, "", fmt.Errorf("cannot specify %s and %s", mode, f)
			}
			mode = f
		default:
			err := IncludeConfig(conf, f)
			if err != nil {
				return nil, "", fmt.Errorf("failed to read config %s: %v", f, err)
			}
		}
	}

	if mode == "" {
		mode = SUBMIT_MODE // default is submit
	}
	return conf, mode, nil
}
