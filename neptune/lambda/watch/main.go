package main

import (
	"context"
	"encoding/json"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/gmmapowell/ignorance/neptune/internal/client"
)

type MessagePayload struct {
	Action string `json:"action"`
	Userid string `json:"id"`
}

var sender *client.Sender

func handleRequest(ctx context.Context, event events.APIGatewayWebsocketProxyRequest) error {
	if sender == nil {
		sender = client.NewSender(event.RequestContext.DomainName, event.RequestContext.Stage)
	}

	if event.IsBase64Encoded {
		log.Printf("cannot unmarshal request in base64")
		return nil
	}

	var request MessagePayload
	if err := json.Unmarshal([]byte(event.Body), &request); err != nil {
		log.Printf("Failed to unmarshal body: %v", err)
		return err
	}

	switch request.Action {
	case "user":
		log.Printf("request for stocks for %s\n", request.Userid)
		payload := []client.Quote{{Ticker: "EIQQ", Price: 2200}}
		return sender.SendTo(event.RequestContext.ConnectionID, payload)
	default:
		log.Printf("cannot handle user request: %s", request.Action)
		return nil
	}
}

func main() {
	lambda.Start(handleRequest)
}
