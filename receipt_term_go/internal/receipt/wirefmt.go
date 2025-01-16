package receipt

import "encoding/binary"

type WireBlock struct {
	P1, P2 byte
	Data   []byte
}

func (r *Receipt) AsWire() []WireBlock {
	wire := make([]WireBlock, 0)
	for p2, q := range r.Headers {
		wire = append(wire, CodeWire(0x11, byte(p2+1), encodeString(q)))
	}
	for p2, q := range r.Preface {
		wire = append(wire, CodeWire(0x12, byte(p2+1), q.AsWire()))
	}
	for p2, q := range r.LineItems {
		wire = append(wire, CodeWire(0x21, byte(p2+1), q.AsWire()))
		for cp2, c := range q.Comments {
			wire = append(wire, CodeWire(0x22, byte(cp2+1), c.AsWire()))
		}
	}
	for _, q := range r.Totals {
		wire = append(wire, CodeWire(q.Type, 0x01, q.AsWire()))
	}
	for p2, q := range r.Payments {
		wire = append(wire, CodeWire(0x41, byte(p2+1), q.AsWire()))
	}
	for p2, q := range r.Footers {
		wire = append(wire, CodeWire(0x51, byte(p2+1), encodeString(q)))
	}
	return wire
}

func (p *Preface) AsWire() []byte {
	ret := encodeString(p.Title)
	ret = append(ret, encodeString(p.Value)...)
	return ret
}

func (li *LineItem) AsWire() []byte {
	ret := encodeString(li.Desc)
	ret = append(ret, li.Price.AsWire()...)
	return ret
}

func (q *LineItemQuant) AsWire() []byte {
	ret := encodeInt(q.Quant)
	ret = append(ret, q.UnitPrice.AsWire()...)
	return ret
}

func (mb *LineItemMultiBuy) AsWire() []byte {
	ret := encodeString(mb.Explanation)
	ret = append(ret, mb.Discount.AsWire()...)
	return ret
}

func (t *TotalLine) AsWire() []byte {
	ret := encodeString(t.Text)
	ret = append(ret, t.Amount.AsWire()...)
	return ret
}

func (p *PaymentLine) AsWire() []byte {
	ret := encodeString(p.Method)
	ret = append(ret, p.Amount.AsWire()...)
	return ret
}

func encodeInt(i int) []byte {
	ret := make([]byte, 4)
	binary.BigEndian.PutUint32(ret, uint32(i))
	return ret
}

func encodeString(s string) []byte {
	if len(s) > 255 {
		panic("can only handle strings up to 255 bytes")
	}
	ret := []byte{byte(len(s))}
	ret = append(ret, []byte(s)...)
	return ret
}

func CodeWire(code byte, idx byte, data []byte) WireBlock {
	return WireBlock{code, idx, data}
}
