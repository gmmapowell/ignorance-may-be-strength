package parser

type InvalidScope struct {
}

func (s *InvalidScope) PresentTokens(_ int, _ []string) Scope {
	panic("cannot pass tokens to invalid scope")
}

func (s *InvalidScope) Close() {
	// Nothing happens here, but it is opened and it can be closed
}
