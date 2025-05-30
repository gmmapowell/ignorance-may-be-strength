package govtalk

type GovTalk interface {
	Identity(send, pwd string)
	Utr(utr string)
	Product(vendor, product, version string)
	AsXML() any
}

func MakeGovTalk() GovTalk {
	return &GovTalkMessage{}
}

type GovTalkMessage struct {
	sender, password         string
	utr                      string
	vendor, product, version string
}

func (gtm *GovTalkMessage) Identity(send, pwd string) {
	gtm.sender = send
	gtm.password = pwd
}

func (gtm *GovTalkMessage) Utr(utr string) {
	gtm.utr = utr
}

func (gtm *GovTalkMessage) Product(vendor, product, version string) {
	gtm.vendor = vendor
	gtm.product = product
	gtm.version = version
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
			ElementWithText("SenderID", gtm.sender),
			ElementWithNesting(
				"Authentication",
				ElementWithText("Method", "clear"),
				ElementWithText("Role", "Principal"),
				ElementWithText("Value", gtm.password),
			),
		),
	)
	gtDetails := ElementWithNesting(
		"GovTalkDetails",
		ElementWithNesting("Keys", Key("UTR", gtm.utr)),
		ElementWithNesting("TargetDetails", ElementWithText("Organisation", "HMRC")),
		ElementWithNesting(
			"ChannelRouting",
			ElementWithNesting(
				"Channel",
				ElementWithText("URI", gtm.vendor),
				ElementWithText("Product", gtm.product),
				ElementWithText("Version", gtm.version),
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
