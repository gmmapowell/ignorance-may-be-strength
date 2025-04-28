package writer

import (
	"encoding/xml"
	"fmt"
)

type DateInfo struct {
	Year, Month, Day int
	HHMM             int
}

type DateXML struct {
	XMLName xml.Name `xml:"ts:date"`
	Value   string   `xml:",chardata"`
}

type GDateXML struct {
	XMLName xml.Name `xml:"gdate"`
	Value   string   `xml:",chardata"`
}

func Date(yyyy, mm, dd, hhmm int) DateInfo {
	return DateInfo{Year: yyyy, Month: mm, Day: dd, HHMM: hhmm}
}

func (d DateInfo) AsXML() DateXML {
	return DateXML{Value: d.String()}
}

func (d DateInfo) AsGDateXML() GDateXML {
	return GDateXML{Value: d.JustDate()}
}

func (d DateInfo) String() string {
	return fmt.Sprintf("%04d-%02d-%02d %02d:%02d:00 +0000", d.Year, d.Month, d.Day, d.HHMM/100, d.HHMM%100)
}

func (d DateInfo) JustDate() string {
	return fmt.Sprintf("%04d-%02d-%02d", d.Year, d.Month, d.Day)
}
