package apdu

import (
	"fmt"
	"log"

	"github.com/deeper-x/gopcsc/smartcard"
	"github.com/gmmapowell/ignorance/receipt_term/internal/receipt"
)

type BlockSender interface {
	Transmit(receipt.WireBlock) error
	Close() error
}

type ApduSender struct {
	card *smartcard.Card
}

func (sender *ApduSender) Transmit(blk receipt.WireBlock) error {
	cmd := writeBlock(blk.P1, blk.P2, blk.Data)
	reply, err := sender.card.TransmitAPDU(cmd)
	if err != nil {
		return err
	}
	if !isOK(reply) {
		return fmt.Errorf("invalid response from phone")
	}
	return nil
}

func (sender *ApduSender) Close() error {
	log.Printf("closing communication after sending receipt")
	// writing to 0,0 says "we're done".  The data is irrelevant but we need to write at least one byte
	cmd := writeBlock(0, 0, []byte{0x00})
	reply, err := sender.card.TransmitAPDU(cmd)
	if err != nil {
		return err
	}
	if !isOK(reply) {
		return fmt.Errorf("invalid response from phone")
	}
	// We could disconnect, but the main loop does that anyway
	// a.card.Disconnect()
	return nil
}

func writeBlock(p1 byte, p2 byte, data []byte) smartcard.CommandAPDU {
	if len(data) < 1 || len(data) > 65535 {
		panic(fmt.Sprintf("cannot write block of size %d", len(data)))
	}
	apdu := []byte{0xFF, 0xD6, p1, p2}
	apdu = xxLen(apdu, len(data))
	apdu = append(apdu, data...)
	return smartcard.CommandAPDU(apdu)
}

// Transmit an "XX" length
//   - for values 1-255, write a single byte
//   - for values 256-65535, write a zero, followed by MSB followed by LSB
func xxLen(apdu []byte, length int) []byte {
	if length < 256 {
		return append(apdu, byte(length))
	} else {
		return append(apdu, 0x00, byte(length/256), byte(length%256))
	}
}

func isOK(data []byte) bool {
	if data == nil || len(data) != 2 {
		return false
	}
	return data[0] == 0x90 && data[1] == 0x00
}

func Sender(card *smartcard.Card) BlockSender {
	return &ApduSender{card: card}
}
