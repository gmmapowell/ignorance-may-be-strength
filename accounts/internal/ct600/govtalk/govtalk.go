package govtalk

import (
	"bytes"
	"crypto/sha1"
	"encoding/base64"
	"encoding/xml"
	"fmt"
	"strings"

	"github.com/ucarion/c14n"
)

type GovTalk interface {
	Identity(send, pwd string)
	Utr(utr string)
	Product(vendor, product, version string)
	AsXML() (*GovTalkMessageXML, error)
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

func (gtm *GovTalkMessage) AsXML() (*GovTalkMessageXML, error) {
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
	var canonBody string
	if gtm.opts.IncludeBody {
		body = gtm.makeBody()
		var err error
		canonBody, err = canonicaliseBody(body)
		if err != nil {
			return nil, err
		}
	}

	gt := MakeGovTalkMessage(
		canonBody,
		env,
		ElementWithNesting("Header", msgDetails, sndrDetails),
		gtDetails)

	return gt, nil
}

func (gtm *GovTalkMessage) makeBody() *SimpleElement {
	body := ElementWithNesting("Body")
	body.Elements = append(body.Elements, gtm.opts.IRenvelope.AsXML())
	return body
}

func canonicaliseBody(from *SimpleElement) (string, error) {
	body := MakeBodyWithSchemaMessage(from.Elements...)

	// Generate a text representation
	bs, err := xml.MarshalIndent(body, "  ", "  ")
	if err != nil {
		return "", err
	}

	bs, err = placeBefore(bs, "<Sender>", "\n        ")
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

	// remove the "fake" schema
	bs, err = deleteBetween(out, "<Body", ">")
	if err != nil {
		return "", err
	}

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

func deleteBetween(bs []byte, from string, to string) ([]byte, error) {
	canonBody := string(bs)
	j := strings.Index(canonBody, from)
	if j == -1 {
		return nil, fmt.Errorf("did not find " + from)
	}
	j += len(from)
	j1 := strings.Index(canonBody[j:], to)
	canonBody = canonBody[0:j] + canonBody[j+j1:]
	return []byte(canonBody), nil
}
