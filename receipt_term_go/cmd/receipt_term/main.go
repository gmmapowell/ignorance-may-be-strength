package main

import (
	"fmt"
	"log"

	"github.com/gmmapowell/ignorance/receipt_term/internal/apdu"
	"github.com/gmmapowell/ignorance/receipt_term/internal/receipt"
	"github.com/gmmapowell/ignorance/receipt_term/internal/store"

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
	sender := apdu.Sender(card)
	receipt, err := generateReceipt()
	if err != nil {
		log.Printf("error: %s\n", err)
	} else {
		err = transmitReceipt(sender, receipt)
		if err != nil {
			log.Printf("error: %s\n", err)
		}
	}

	card.Disconnect()
	reader.WaitUntilCardRemoved()
	log.Printf("disconnected from smart card\n")
}

func generateReceipt() (*receipt.Receipt, error) {
	store := store.AnyStore()
	if store == nil {
		return nil, fmt.Errorf("no store found")
	}
	receipt := store.MakePurchase()
	if receipt == nil {
		return nil, fmt.Errorf("no receipt generated")

	}
	return receipt, nil
}

func transmitReceipt(sender apdu.BlockSender, send *receipt.Receipt) error {
	err := sender.SelectAID(0xf1, "gmmapowell-app1")
	if err != nil {
		log.Printf("error: %s\n", err)
		return err
	}
	blocks := send.AsWire()
	for i, blk := range blocks {
		log.Printf("sending blk %d", i)
		err := sender.Transmit(blk)
		if err != nil {
			return err
		}
	}
	err = sender.Close()
	if err != nil {
		return fmt.Errorf("failed to close: %v", err)
	}
	log.Printf("finished sending receipt\n")
	return nil
}
