package submission

import (
	"bytes"
	"encoding/xml"
	"fmt"
	"io"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/govtalk"
)

func Generate() (io.Reader, error) {
	msg := govtalk.MakeGovTalk()
	bs, err := xml.MarshalIndent(msg.AsXML(), "", "  ")
	if err != nil {
		return nil, err
	}
	fmt.Printf("%s", string(bs))
	return bytes.NewReader(bs), nil
}
