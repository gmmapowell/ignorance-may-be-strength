package govtalk

import "encoding/xml"

type GovTalk interface {
	AsXML() any
}

func MakeGovTalk() GovTalk {
	return &GovTalkMessage{}
}

type GovTalkMessage struct {
}

func (gtm *GovTalkMessage) AsXML() any {
	ret := &GovTalkMessageXML{}
	ret.XMLNS = "http://www.govtalk.gov.uk/CM/envelope"
	ret.XSI = "http://www.w3.org/2001/XMLSchema-instance"
	env := &SimpleElement{XMLName: xml.Name{Local: "EnvelopeVersion"}}
	env.Text = "2.0"
	ret.Elements = append(ret.Elements, env)
	return ret
}
