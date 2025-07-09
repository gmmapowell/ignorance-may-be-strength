package govtalk

import (
	"bytes"
	"crypto/sha1"
	"encoding/base64"
	"encoding/xml"
	"fmt"
	"slices"

	"github.com/ucarion/c14n"
)

type GovTalk interface {
	Identity(send, pwd string)
	Utr(utr string)
	Product(vendor, product, version string)
	AsXML() (any, error)
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

func (gtm *GovTalkMessage) AsXML() (any, error) {
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
	}

	gt := MakeGovTalkMessage(env,
		ElementWithNesting("Header", msgDetails, sndrDetails),
		gtDetails,
		body)

	if body != nil {
		irmark, err := calculateIRmark(gt)
		if err != nil {
			return nil, err
		}
		attachIRmark(body, irmark)
	}

	return gt, nil
}

func (gtm *GovTalkMessage) makeBody() *SimpleElement {
	body := ElementWithNesting("Body")
	body.Elements = append(body.Elements, gtm.opts.IRenvelope.AsXML())
	return body
}

func attachIRmark(body *SimpleElement, irmark string) {
	ire := body.Elements[0].(*IRenvelopeXML)
	irh := ire.Elements[0].(*SimpleElement)
	irh.Elements = slices.Insert(irh.Elements, len(irh.Elements)-1, any(MakeIRmark(irmark)))
}

func calculateIRmark(body any) (string, error) {
	// Generate a text representation
	bs, err := xml.MarshalIndent(body, "", "  ")
	if err != nil {
		return "", err
	}

	// now canonicalise that
	decoder := xml.NewDecoder(bytes.NewReader(bs))
	out, err := c14n.Canonicalize(decoder)
	if err != nil {
		return "", err
	}

	// Generate a SHA-1 encoding
	hasher := sha1.New()
	_, err = hasher.Write(out)
	if err != nil {
		return "", err
	}
	sha := hasher.Sum(nil)

	// And then turn that into Base64
	w := new(bytes.Buffer)
	enc := base64.NewEncoder(base64.StdEncoding, w)
	enc.Write(sha)
	enc.Close()

	// The string of this is the IRmark
	b64sha := w.String()
	fmt.Printf("IRmark: %d %s\n", len(b64sha), b64sha)

	return b64sha, nil
}
