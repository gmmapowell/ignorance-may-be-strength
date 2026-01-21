package govtalk

import (
	"bytes"
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"strings"

	"github.com/unix-world/smartgoext/xml-utils/etree"
	"github.com/unix-world/smartgoplus/xml-utils/c14n"
)

type GovTalk interface {
	Identity(send, pwd string)
	Utr(utr string)
	Product(vendor, product, version string)
	AsXML() (*etree.Element, error)
	MakeCanonicalBody() (string, error)
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
	env := ElementWithText("EnvelopeVersion", "2.0")
	var corrId *etree.Element
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
	var sndrDetails *etree.Element
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
	var keys *etree.Element
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

	gt := MakeGovTalkMessage(
		env,
		ElementWithNesting("Header", msgDetails, sndrDetails),
		gtDetails)

	return gt, nil
}

func (gtm *GovTalkMessage) MakeCanonicalBody() (string, error) {
	var body *etree.Element
	if gtm.opts.IncludeBody {
		body = gtm.makeBody()
		return canonicaliseBody(body)
	} else {
		return "", nil
	}
}

func (gtm *GovTalkMessage) makeBody() *etree.Element {
	body := ElementWithNesting("Body", gtm.opts.IRenvelope.AsXML())
	body.Attr = append(body.Attr, etree.Attr{Key: "xmlns", Value: "http://www.govtalk.gov.uk/CM/envelope"}, etree.Attr{Space: "xmlns", Key: "xsi", Value: "http://www.w3.org/2001/XMLSchema-instance"})
	return body
}

func canonicaliseBody(body *etree.Element) (string, error) {
	body.IndentWithSettings(&etree.IndentSettings{Spaces: 2})
	w1 := bytes.Buffer{}
	ws := etree.WriteSettings{}
	body.WriteTo(&w1, &ws)

	bs, err := placeBefore(w1.Bytes(), "<Sender>", "\n        ")
	if err != nil {
		return "", err
	}

	canon := c14n.MakeC14N11Canonicalizer()
	out, err := canon.Canonicalize(body)
	if err != nil {
		return "", err
	}

	// Generate a SHA-1 encoding
	hasher := sha1.New()
	_, err = hasher.Write([]byte(out))
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

	// Add the IRmark
	bs, err = placeBefore(bs, "\n        <Sender>", `<IRmark Type="generic">`+b64sha+"</IRmark>")
	if err != nil {
		return "", err
	}

	// Fix up whitespace around Body
	ret := "  " + string(bs) + "\n"

	return ret, err
}

func placeBefore(bs []byte, match string, insert string) ([]byte, error) {
	str := string(bs)
	s1 := strings.Index(str, match)
	if s1 == -1 {
		return nil, fmt.Errorf("did not find " + match)
	}
	str = str[0:s1] + insert + str[s1:]
	bs = []byte(str)
	return bs, nil
}
