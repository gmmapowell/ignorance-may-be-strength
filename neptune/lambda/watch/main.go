package main

import (
	"context"
	"encoding/json"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/neptunedata"
	"github.com/gmmapowell/ignorance/neptune/internal/client"
	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
	"github.com/gmmapowell/ignorance/neptune/internal/neptune"
)

type MessagePayload struct {
	Action string `json:"action"`
	Userid string `json:"id"`
}

var sender *client.Sender
var nepcli *neptunedata.Client
var dyncli *dynamodb.Client

func handleRequest(ctx context.Context, event events.APIGatewayWebsocketProxyRequest) error {
	if nepcli == nil {
		log.Printf("attemnpting to connect to neptune")
		var err error
		nepcli, err = neptune.OpenNeptune("user-stocks")
		if err != nil {
			log.Printf("could not open neptune")
			return err
		}
	}
	if dyncli == nil {
		log.Printf("attemnpting to connect to dynamo")
		var err error
		dyncli, err = dynamo.OpenDynamo()
		if err != nil {
			log.Printf("could not open dynamo")
			return err
		}
	}
	if sender == nil {
		log.Printf("creating websocket sender")
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
		err := neptune.ConnectEndpoint(nepcli, request.Userid, event.RequestContext.ConnectionID)
		if err != nil {
			log.Printf("Failed to record connection id for %s in neptune: %v\n", request.Userid, err)
			return err
		}
		log.Printf("finding neptune watched stocks")
		stocks, err := neptune.FindWatchedStocks(nepcli, request.Userid)
		if err != nil {
			log.Printf("Failed to find stocks for %s: %v\n", request.Userid, err)
			return err
		}
		log.Printf("finding dynamo stock prices")
		quotes, err := dynamo.FindStockPrices(dyncli, "Stocks", stocks)
		if err != nil {
			log.Printf("Failed to find stock prices for %s (%v): %v\n", request.Userid, stocks, err)
			return err
		}
		var payload []client.Quote
		for t, p := range quotes {
			payload = append(payload, client.Quote{Ticker: t, Price: p})
		}
		log.Printf("sending response")
		return sender.SendTo(event.RequestContext.ConnectionID, payload)
	default:
		log.Printf("cannot handle user request: %s", request.Action)
		return nil
	}
}

func main() {
	lambda.Start(handleRequest)
}
