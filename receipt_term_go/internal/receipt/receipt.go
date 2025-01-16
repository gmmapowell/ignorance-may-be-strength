package receipt

type Receipt struct {
	Headers   []string
	Preface   []Preface
	LineItems []LineItem
	Totals    []TotalLine
	Payments  []PaymentLine
	Footers   []string
}

type Preface struct {
	Title string
	Value string
}

type LineItem struct {
	Desc     string
	Price    Money
	Comments []LineItemComment
}

type LineItemComment interface {
	AsWire() []byte
}

type LineItemQuant struct {
	Quant     int
	UnitPrice Money
}

type LineItemMultiBuy struct {
	Explanation string
	Discount    Money
}

type TotalLine struct {
	Type   byte
	Text   string
	Amount Money
}

type PaymentLine struct {
	Method string
	Amount Money
}
