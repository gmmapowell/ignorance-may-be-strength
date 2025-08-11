package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"net/url"
	"strconv"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/neptunedata"
	"github.com/gmmapowell/ignorance/neptune/internal/client"
	"github.com/gmmapowell/ignorance/neptune/internal/dynamo"
	"github.com/gmmapowell/ignorance/neptune/internal/model"
	"github.com/gmmapowell/ignorance/neptune/internal/neptune"
)

var sender *client.Sender
var nepcli *neptunedata.Client
var dyncli *dynamodb.Client

func handleRequest(ctx context.Context, event events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	if nepcli == nil {
		log.Printf("attemnpting to connect to neptune")
		var err error
		nepcli, err = neptune.OpenNeptune("user-stocks")
		if err != nil {
			log.Printf("could not open neptune")
			return events.APIGatewayV2HTTPResponse{StatusCode: 500, Body: "could not open neptune"}, err
		}
	}
	if dyncli == nil {
		log.Printf("attemnpting to connect to dynamo")
		var err error
		dyncli, err = dynamo.OpenDynamo()
		if err != nil {
			log.Printf("could not open dynamo")
			return events.APIGatewayV2HTTPResponse{StatusCode: 500, Body: "could not open dynamo"}, err
		}
	}
	if sender == nil {
		log.Printf("creating websocket sender")
		sender = client.NewSender("n2n2psybtd.execute-api.us-east-1.amazonaws.com", "development")
	}

	formData, r, err := readForm(&event)
	if r != nil {
		return *r, err
	}

	quotes, r, err := buildQuotes(formData)
	if r != nil {
		return *r, err
	}

	updater, err := dynamo.NewUpdater(dyncli)
	if err != nil {
		log.Printf("could not create updater")
		return events.APIGatewayV2HTTPResponse{StatusCode: 500, Body: "could not create updater"}, err
	}
	for _, q := range quotes {
		s := model.Stock{Symbol: q.Ticker, Price: q.Price}
		err := updater.Update("Stocks", s)
		if err != nil {
			log.Printf("could not update price for %s: %v\n", q.Ticker, err)
			continue
		}
		conns, err := neptune.FindStockWatchers(nepcli, q.Ticker)
		if err != nil {
			log.Printf("could not recover watchers for %s: %v\n", q.Ticker, err)
			continue
		}

		for _, conn := range conns {
			log.Printf("have quotes %v; sending to %s\n", quotes, conn)
			err := sender.SendTo(conn.ConnectionId, quotes)
			if err != nil {
				log.Printf("Failed to send to connection id %s for %s in neptune: %v\n", conn.ConnectionId, conn.User, err)
				err = neptune.DisconnectEndpoint(nepcli, conn.ConnectionId)
				if err != nil {
					log.Printf("Error disconnecting %s for %s: %v\n", conn.ConnectionId, conn.User, err)
				}
			}
		}
	}

	resp := events.APIGatewayV2HTTPResponse{StatusCode: 200, Body: ""}
	return resp, nil
}

func readForm(event *events.APIGatewayV2HTTPRequest) (url.Values, *events.APIGatewayV2HTTPResponse, error) {
	method := event.RequestContext.HTTP.Method
	if method != "POST" {
		log.Printf("request was not POST but %s\n", method)
		return nil, &events.APIGatewayV2HTTPResponse{StatusCode: 400, Body: "must use POST"}, nil
	}

	contentType := event.Headers["content-type"]
	if !strings.Contains(contentType, "application/x-www-form-urlencoded") {
		log.Printf("content type did not say it was a form but %s\n", contentType)
		return nil, &events.APIGatewayV2HTTPResponse{StatusCode: 400, Body: "must use content type application/x-www-form-urlencoded"}, nil
	}

	body := event.Body
	if event.IsBase64Encoded {
		decodedBody, err := base64.StdEncoding.DecodeString(body)
		if err != nil {
			log.Printf("error decoding base64: %v\n", err)
			return nil, &events.APIGatewayV2HTTPResponse{StatusCode: 500, Body: "decoding base64 failed"}, err
		}
		body = string(decodedBody)
	}

	// Parse the form data
	formData, err := url.ParseQuery(body)
	if err != nil {
		log.Printf("error parsing body as query: %v\n", err)
		return nil, &events.APIGatewayV2HTTPResponse{StatusCode: 500, Body: "parsing failed"}, err
	}

	return formData, nil, nil
}

func buildQuotes(formData url.Values) ([]client.Quote, *events.APIGatewayV2HTTPResponse, error) {
	tickers := formData["ticker"]
	prices := formData["price"]
	if len(tickers) != len(prices) {
		log.Printf("mismatched tickers and prices: %d %d\n", len(tickers), len(prices))
		return nil, &events.APIGatewayV2HTTPResponse{StatusCode: 400, Body: "mismatched tickers and prices"}, nil
	}

	var quotes []client.Quote
	for i, t := range tickers {
		ps := prices[i]
		p, err := strconv.Atoi(ps)
		if err != nil {
			log.Printf("could not parse %s as a number\n", ps)
			return nil, &events.APIGatewayV2HTTPResponse{StatusCode: 400, Body: fmt.Sprintf("not a number: %s", ps)}, err
		}
		quotes = append(quotes, client.Quote{Ticker: t, Price: p})
	}

	return quotes, nil, nil
}

func main() {
	lambda.Start(handleRequest)
}
