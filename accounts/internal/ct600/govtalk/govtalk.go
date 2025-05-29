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
	header := &SimpleElement{XMLName: xml.Name{Local: "Header"}}
	msgDetails := &SimpleElement{XMLName: xml.Name{Local: "MessageDetails"}}
	test := &SimpleElement{XMLName: xml.Name{Local: "GatewayTest"}}
	test.Text = "1"
	msgDetails.Elements = append(msgDetails.Elements, test)
	sndrDetails := &SimpleElement{XMLName: xml.Name{Local: "SenderDetails"}}
	header.Elements = append(header.Elements, msgDetails, sndrDetails)
	gtDetails := &SimpleElement{XMLName: xml.Name{Local: "GovTalkDetails"}}
	keys := &SimpleElement{XMLName: xml.Name{Local: "Keys"}}
	utr := &KeyElement{Type: "UTR", Value: "8596148860"}
	keys.Elements = append(gtDetails.Elements, utr)
	gtDetails.Elements = append(gtDetails.Elements, keys)
	body := &SimpleElement{XMLName: xml.Name{Local: "Body"}}
	ret.Elements = append(ret.Elements, env, header, gtDetails, body)
	return ret
}
