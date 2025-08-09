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
	"github.com/gmmapowell/ignorance/neptune/internal/client"
)

var sender *client.Sender

func handleRequest(ctx context.Context, event events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	if sender == nil {
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

	// a hack right now; will be replaced with neptune
	connIds := formData["connId"]
	for _, connId := range connIds {
		log.Printf("have quotes %v; sending to %s\n", quotes, connId)
		sender.SendTo(connId, quotes)
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
