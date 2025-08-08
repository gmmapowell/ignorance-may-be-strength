package main

import (
	"context"
	"encoding/json"
	"log"
	"net/url"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/apigatewaymanagementapi"
	transport "github.com/aws/smithy-go/endpoints"
)

type messagePayload struct {
	Action string `json:"action"`
	Userid string `json:"id"`
}

type quotesPayload struct {
	Action       string  `json:"action"`
	ConnectionId string  `json:"connection-id"`
	Quotes       []Quote `json:"quotes"`
}

type Quote struct {
	Ticker string `json:"ticker"`
	Price  int    `json:"price"`
}

var apiClient *apigatewaymanagementapi.Client

func handleRequest(ctx context.Context, event events.APIGatewayWebsocketProxyRequest) error {
	if event.IsBase64Encoded {
		log.Printf("cannot unmarshal request in base64")
		return nil
	}

	var request messagePayload
	if err := json.Unmarshal([]byte(event.Body), &request); err != nil {
		log.Printf("Failed to unmarshal body: %v", err)
		return err
	}

	if apiClient == nil {
		apiClient = NewAPIGatewayManagementClient(event.RequestContext.DomainName, event.RequestContext.Stage)
	}

	switch request.Action {
	case "user":
		log.Printf("request for stocks for %s\n", request.Userid)
		resp := quotesPayload{Action: "quotes", ConnectionId: event.RequestContext.ConnectionID, Quotes: []Quote{{Ticker: "EIQQ", Price: 2200}}}
		msgData, err := json.Marshal(&resp)
		if err != nil {
			return err
		}
		connectionInput := &apigatewaymanagementapi.PostToConnectionInput{
			ConnectionId: aws.String(event.RequestContext.ConnectionID),
			Data:         msgData,
		}
		_, err = apiClient.PostToConnection(context.TODO(), connectionInput)
		log.Printf("sent message to %s, err = %v\n", event.RequestContext.ConnectionID, err)
		return err
	default:
		log.Printf("cannot handle user request: %s", request.Action)
	}
	return nil
}

func NewAPIGatewayManagementClient(domain, stage string) *apigatewaymanagementapi.Client {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Printf("could not init config: %v\n", err)
		return nil
	}
	return apigatewaymanagementapi.NewFromConfig(cfg, func(opts *apigatewaymanagementapi.Options) {
		opts.EndpointResolverV2 = &endpointResolver{domain: domain, stage: stage}
	})
}

type endpointResolver struct {
	domain string
	stage  string
}

func (e *endpointResolver) ResolveEndpoint(ctx context.Context, params apigatewaymanagementapi.EndpointParameters) (transport.Endpoint, error) {
	uri := url.URL{Scheme: "https", Host: e.domain, Path: e.stage}
	return transport.Endpoint{URI: uri}, nil
}

func main() {
	lambda.Start(handleRequest)
}
