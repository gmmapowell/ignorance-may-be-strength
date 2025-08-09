package client

type QuotesPayload struct {
	Action       string  `json:"action"`
	ConnectionId string  `json:"connection-id"`
	Quotes       []Quote `json:"quotes"`
}

type Quote struct {
	Ticker string `json:"ticker"`
	Price  int    `json:"price"`
}
