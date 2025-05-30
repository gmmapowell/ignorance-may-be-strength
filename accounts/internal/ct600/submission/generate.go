package submission

import (
	"bytes"
	"encoding/xml"

	"io"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/config"
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/govtalk"
)

func Generate(conf *config.Config) (io.Reader, error) {
	msg := govtalk.MakeGovTalk()
	msg.Identity(conf.Sender, conf.Password)
	msg.Utr(conf.Utr)
	msg.Product(conf.Vendor, conf.Product, conf.Version)
	bs, err := xml.MarshalIndent(msg.AsXML(), "", "  ")
	if err != nil {
		return nil, err
	}
	// fmt.Printf("%s", string(bs))
	return bytes.NewReader(bs), nil
}
