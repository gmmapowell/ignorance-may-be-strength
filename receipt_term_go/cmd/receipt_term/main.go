package main

import (
	"log"

	"github.com/deeper-x/gopcsc/smartcard"
)

func main() {
	// Create a context
	ctx, err := smartcard.EstablishContext()
	if err != nil {
		panic(err)
	}
	defer ctx.Release()

	for {
		doCardInteraction(ctx)
	}
}

func doCardInteraction(ctx *smartcard.Context) {
	reader, err := ctx.WaitForCardPresent()
	if err != nil {
		panic(err)
	}
	card, err := reader.Connect()
	if err != nil {
		panic(err)
	}
	log.Printf("connected to smart card\n")
	tryToSendReceipt(card)
	card.Disconnect()
	reader.WaitUntilCardRemoved()
	log.Printf("disconnected from smart card\n")
}

func tryToSendReceipt(card *smartcard.Card) {
	log.Printf("placeholder to send receipt to card %v\n", card)
}
