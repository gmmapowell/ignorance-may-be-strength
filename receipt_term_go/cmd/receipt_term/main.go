package main

import (
	"fmt"
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
	log.Printf("selecting receipt app on card\n")
	// select command
	apdu := []byte{0x00, 0xA4, 0x04, 0x00}
	// AID
	apdu = append(apdu, 0x10, 0xF1, 0x67, 0x6d, 0x6d, 0x61, 0x70, 0x6f, 0x77, 0x65, 0x6c, 0x6c, 0x2d, 0x61, 0x70, 0x70, 0x31)
	// Le - expected response length
	apdu = append(apdu, 0x00)
	cmd := smartcard.CommandAPDU(apdu)
	if !cmd.IsValid() {
		panic(fmt.Sprintf("invalid apdu from %v", apdu))
	}
	log.Printf("issuing cmd %s\n", cmd)
	res, err := card.TransmitAPDU(cmd)
	if err != nil {
		panic(err)
	}
	log.Printf("<< %s\n", res)
	if res == nil || len(res) != 2 {
		panic("result was not 2 bytes")
	}
	if res[0] != 0x90 || res[1] != 0x00 {
		log.Printf("response was not 0x90 0x00")
		return
	}
	log.Printf("still need to transmit receipt")
}
