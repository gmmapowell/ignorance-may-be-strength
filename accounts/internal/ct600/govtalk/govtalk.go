package govtalk

type GovTalk interface {
	AsXML() any
}

func MakeGovTalk() GovTalk {
	return &GovTalkMessage{}
}

type GovTalkMessage struct {
}

func (gtm *GovTalkMessage) AsXML() any {
	env := ElementWithText("EnvelopeVersion", "2.0")
	test := ElementWithText("GatewayTest", "1")
	msgDetails := ElementWithNesting("MessageDetails", test)
	sndrDetails := ElementWithNesting("SenderDetails")
	header := ElementWithNesting("Header", msgDetails, sndrDetails)
	utr := Key("UTR", "8596148860")
	keys := ElementWithNesting("Keys", utr)
	gtDetails := ElementWithNesting("GovTalkDetails", keys)
	body := ElementWithNesting("Body")
	return MakeGovTalkMessage(env, header, gtDetails, body)
}
