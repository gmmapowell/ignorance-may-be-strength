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
	msgDetails := ElementWithNesting(
		"MessageDetails",
		ElementWithText("Class", "HMRC-CT-CT600"),
		ElementWithText("Qualifier", "request"),
		ElementWithText("Function", "submit"),
		ElementWithText("Transformation", "XML"),
		ElementWithText("GatewayTest", "1"),
	)
	sndrDetails := ElementWithNesting(
		"SenderDetails",
		ElementWithNesting(
			"IDAuthentication",
			ElementWithText("SenderID", "Provided by the SDST"),
			ElementWithNesting(
				"Authentication",
				ElementWithText("Method", "clear"),
				ElementWithText("Role", "Principal"),
				ElementWithText("Value", "Provided by the SDST"),
			),
		),
	)
	gtDetails := ElementWithNesting(
		"GovTalkDetails",
		ElementWithNesting("Keys", Key("UTR", "8596148860")),
		ElementWithNesting("TargetDetails", ElementWithText("Organisation", "HMRC")),
		ElementWithNesting(
			"ChannelRouting",
			ElementWithNesting(
				"Channel",
				ElementWithText("URI", "Vendor ID"),
				ElementWithText("Product", "Product Details"),
				ElementWithText("Version", "Version #"),
			),
		),
	)
	return MakeGovTalkMessage(env,
		ElementWithNesting("Header", msgDetails, sndrDetails),
		gtDetails,
		gtm.makeBody())
}

func (gtm *GovTalkMessage) makeBody() any {
	body := ElementWithNesting("Body")
	return &body
}
