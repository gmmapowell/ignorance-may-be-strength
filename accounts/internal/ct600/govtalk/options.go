package govtalk

type EnvelopeOptions struct {
	Qualifier         string
	Function          string
	SendCorrelationID bool
	CorrelationID     string
	IncludeSender     bool
	IncludeKeys       bool
	IncludeBody       bool
}
