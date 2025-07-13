package dynamo

import (
	"context"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func FindStockPrices(table string, stocks []string) (map[string]int, error) {
	svc, err := openDynamo()
	if err != nil {
		return nil, err
	}
	var keys []map[string]types.AttributeValue
	var attrs []string
	for _, s := range stocks {
		key := make(map[string]types.AttributeValue)
		key["Symbol"] = &types.AttributeValueMemberS{Value: s}
		keys = append(keys, key)
	}
	attrs = append(attrs, "Symbol", "Price")
	tableRequest := make(map[string]types.KeysAndAttributes)
	tableRequest[table] = types.KeysAndAttributes{Keys: keys, AttributesToGet: attrs}
	out, err := svc.BatchGetItem(context.TODO(), &dynamodb.BatchGetItemInput{RequestItems: tableRequest})
	if err != nil {
		return nil, err
	}

	ret := make(map[string]int)
	for _, x := range out.Responses[table] {
		sym := x["Symbol"].(*types.AttributeValueMemberS).Value
		price := x["Price"].(*types.AttributeValueMemberN).Value
		ret[sym], err = strconv.Atoi(price)
	}
	return ret, nil
}
