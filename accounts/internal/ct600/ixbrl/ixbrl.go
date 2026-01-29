package ixbrl

import (
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/xml"
	"github.com/unix-world/smartgoext/xml-utils/etree"
)

type IXBRL struct {
}

func (i *IXBRL) AsEtree() *etree.Element {
	return xml.ElementWithNesting("html")
}

func NewIXBRL() *IXBRL {
	return &IXBRL{}
}
