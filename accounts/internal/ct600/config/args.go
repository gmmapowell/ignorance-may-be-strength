package config

import (
	"fmt"
)

const SUBMIT_MODE = "--submit"
const LIST_MODE = "--list"
const POLL_MODE = "--poll"

func ParseArguments(args []string) (*Config, string, error) {
	mode := ""
	conf := MakeBlankConfig()
	for _, f := range args {
		switch f {
		case LIST_MODE:
			fallthrough
		case POLL_MODE:
			fallthrough
		case SUBMIT_MODE:
			if mode != "" {
				return nil, "", fmt.Errorf("cannot specify %s and %s", mode, f)
			}
			mode = f
		default:
			if mode == POLL_MODE {
				err := PollParameter(conf, f)
				if err != nil {
					return nil, "", err
				}
			} else {
				err := IncludeConfig(conf, f)
				if err != nil {
					return nil, "", fmt.Errorf("failed to read config %s: %v", f, err)
				}
			}
		}
	}

	if mode == "" {
		mode = SUBMIT_MODE // default is submit
	}
	return conf, mode, nil
}
