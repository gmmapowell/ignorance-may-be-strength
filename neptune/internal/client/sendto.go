package client

import (
	"context"
	"encoding/json"
	"log"
	"net/url"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/apigatewaymanagementapi"
	transport "github.com/aws/smithy-go/endpoints"
)

type Sender struct {
	apiClient *apigatewaymanagementapi.Client
}

func NewSender(domain, stage string) *Sender {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Printf("could not init config: %v\n", err)
		return nil
	}
	apiClient := apigatewaymanagementapi.NewFromConfig(cfg, func(opts *apigatewaymanagementapi.Options) {
		opts.EndpointResolverV2 = &endpointResolver{domain: domain, stage: stage}
	})
	return &Sender{apiClient: apiClient}
}

func (s *Sender) SendTo(connId string, quotes []Quote) error {
	resp := QuotesPayload{Action: "quotes", ConnectionId: connId, Quotes: quotes}
	msgData, err := json.Marshal(&resp)
	if err != nil {
		return err
	}
	log.Printf("marshalling as %s\n", string(msgData))
	connectionInput := &apigatewaymanagementapi.PostToConnectionInput{
		ConnectionId: aws.String(connId),
		Data:         msgData,
	}
	_, err = s.apiClient.PostToConnection(context.TODO(), connectionInput)
	log.Printf("sent message to %s, err = %v\n", connId, err)
	return err
}

type endpointResolver struct {
	domain string
	stage  string
}

func (e *endpointResolver) ResolveEndpoint(ctx context.Context, params apigatewaymanagementapi.EndpointParameters) (transport.Endpoint, error) {
	uri := url.URL{Scheme: "https", Host: e.domain, Path: e.stage}
	return transport.Endpoint{URI: uri}, nil
}
