package submission

import (
	"bytes"
	"log"
	"os"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/govtalk"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/unix-world/smartgoext/xml-utils/etree"
)

func Poll(saveAs string, conf *config.Configuration) (*etree.Element, error) {
	pollOptions := &govtalk.EnvelopeOptions{Qualifier: "poll", Function: "submit", SendCorrelationID: true, CorrelationID: conf.CorrelationID, IncludeSender: false}
	send, err := govtalk.Generate("", false, conf, pollOptions)
	if err != nil {
		return nil, err
	}

	msg, err := transmitTo(conf.PollURI, send)
	if err != nil {
		return nil, err
	}

	doc := etree.Document{}
	doc.ReadFrom(bytes.NewReader(msg))
	elt := doc.Element.ChildElements()[0]
	for _, e := range elt.ChildElements() {
		if e.Tag == "Body" {
			if len(e.ChildElements()) == 0 {
				return elt, nil
			}
		}
	}
	elt.IndentWithSettings(&etree.IndentSettings{Spaces: 2})
	if saveAs != "" {
		w := bytes.Buffer{}
		ws := etree.WriteSettings{}
		elt.WriteTo(&w, &ws)
		os.WriteFile(saveAs, w.Bytes(), 0666)
	}
	mesg := elt.FindElement("/GovTalkMessage/Body/SuccessResponse/IRmarkReceipt/Message")
	if mesg == nil {
		panic("there was no message in the response")
	}
	log.Printf("Response message was: " + mesg.Text())
	return nil, nil
}
