package govtalk

import (
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/xml"
	"github.com/unix-world/smartgoext/xml-utils/etree"
)

type GovTalk interface {
	Identity(send, pwd string)
	Utr(utr string)
	Product(vendor, product, version string)
	AsXML() (*etree.Element, error)
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

func (gtm *GovTalkMessage) AsXML() (*etree.Element, error) {
	env := xml.ElementWithText("EnvelopeVersion", "2.0")
	var corrId *etree.Element
	if gtm.opts.SendCorrelationID {
		corrId = xml.ElementWithText("CorrelationID", gtm.opts.CorrelationID)
	}
	msgDetails := xml.ElementWithNesting(
		"MessageDetails",
		xml.ElementWithText("Class", "HMRC-CT-CT600"),
		xml.ElementWithText("Qualifier", gtm.opts.Qualifier),
		xml.ElementWithText("Function", gtm.opts.Function),
		corrId,
		xml.ElementWithText("Transformation", "XML"),
		xml.ElementWithText("GatewayTest", "1"),
	)
	var sndrDetails *etree.Element
	if gtm.opts.IncludeSender {
		sndrDetails = xml.ElementWithNesting(
			"SenderDetails",
			xml.ElementWithNesting(
				"IDAuthentication",
				xml.ElementWithText("SenderID", gtm.sender),
				xml.ElementWithNesting(
					"Authentication",
					xml.ElementWithText("Method", "clear"),
					xml.ElementWithText("Role", "Principal"),
					xml.ElementWithText("Value", gtm.password),
				),
			),
		)
	}
	var keys *etree.Element
	if gtm.opts.IncludeKeys {
		keys = xml.ElementWithNesting("Keys", xml.Key("UTR", gtm.utr))
	} else {
		keys = xml.ElementWithNesting("Keys")
	}
	gtDetails := xml.ElementWithNesting(
		"GovTalkDetails",
		keys,
		xml.ElementWithNesting("TargetDetails", xml.ElementWithText("Organisation", "HMRC")),
		xml.ElementWithNesting(
			"ChannelRouting",
			xml.ElementWithNesting(
				"Channel",
				xml.ElementWithText("URI", gtm.vendor),
				xml.ElementWithText("Product", gtm.product),
				xml.ElementWithText("Version", gtm.version),
			),
		),
	)

	gt := xml.MakeGovTalkMessage(
		env,
		xml.ElementWithNesting("Header", msgDetails, sndrDetails),
		gtDetails)

	return gt, nil
}
