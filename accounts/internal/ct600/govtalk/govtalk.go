package govtalk

import (
	"log"
	"slices"
)

type GovTalk interface {
	Identity(send, pwd string)
	Utr(utr string)
	Product(vendor, product, version string)
	AsXML() any
}

func MakeGovTalk(opts *EnvelopeOptions) GovTalk {
	return &GovTalkMessage{opts: opts}
}

type GovTalkMessage struct {
	sender, password         string
	utr                      string
	vendor, product, version string
	opts                     *EnvelopeOptions
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
	var corrId *SimpleElement
	if gtm.opts.SendCorrelationID {
		corrId = ElementWithText("CorrelationID", gtm.opts.CorrelationID)
	}
	msgDetails := ElementWithNesting(
		"MessageDetails",
		ElementWithText("Class", "HMRC-CT-CT600"),
		ElementWithText("Qualifier", gtm.opts.Qualifier),
		ElementWithText("Function", gtm.opts.Function),
		corrId,
		ElementWithText("Transformation", "XML"),
		ElementWithText("GatewayTest", "1"),
	)
	var sndrDetails *SimpleElement
	if gtm.opts.IncludeSender {
		sndrDetails = ElementWithNesting(
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
	}
	var keys *SimpleElement
	if gtm.opts.IncludeKeys {
		keys = ElementWithNesting("Keys", Key("UTR", gtm.utr))
	} else {
		keys = ElementWithNesting("Keys")
	}
	gtDetails := ElementWithNesting(
		"GovTalkDetails",
		keys,
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
	var body *SimpleElement
	if gtm.opts.IncludeBody {
		body = gtm.makeBody()
		attachIRmark(body, calculateIRmark(body))
	}
	return MakeGovTalkMessage(env,
		ElementWithNesting("Header", msgDetails, sndrDetails),
		gtDetails,
		body)
}

func (gtm *GovTalkMessage) makeBody() *SimpleElement {
	body := ElementWithNesting("Body")
	body.Elements = append(body.Elements, gtm.opts.IRenvelope.AsXML())
	return body
}

func attachIRmark(body *SimpleElement, irmark string) {
	log.Printf("%p", body)
	ire := body.Elements[0].(*IRenvelopeXML)
	irh := ire.Elements[0].(*SimpleElement)
	irh.Elements = slices.Insert(irh.Elements, len(irh.Elements)-1, any(MakeIRmark(irmark)))
}

func calculateIRmark(body *SimpleElement) string {
	return "need to calculate a SHA-1 tag"
}
