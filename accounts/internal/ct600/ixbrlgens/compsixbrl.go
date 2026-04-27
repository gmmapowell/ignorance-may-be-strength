package ixbrlgens

import (
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/ixbrl"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/reporter"
)

type GnuCashComputationsIXBRLGenerator struct {
	config *config.Configuration
	styles string
}

func (g *GnuCashComputationsIXBRLGenerator) Generate() *ixbrl.IXBRL {
	ret := ixbrl.NewIXBRL(g.config.Business.Name+" - Tax Computations", "http://www.hmrc.gov.uk/schemas/ct/comp/2024-01-01/ct-comp-2024.xsd", g.styles)
	ret.AddSchema("ct-comp", "http://www.hmrc.gov.uk/schemas/ct/comp/2024-01-01")

	cyStart := ixbrl.NewDate(g.config.Ranges["CY"].Start)
	cyEnd := ixbrl.NewDate(g.config.Ranges["CY"].End)

	ret.AddContext(&ixbrl.Context{ID: "CYEnd", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, Instant: cyEnd, Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("ct-comp:BusinessTypeDimension", "ct-comp:Company"), ixbrl.MakeExplicitMember("ct-comp:DetailedAnalysisDimension", "ct-comp:Item1")}})
	ret.AddContext(&ixbrl.Context{ID: "CY", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyEnd, ToDate: cyEnd, Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("ct-comp:BusinessTypeDimension", "ct-comp:Company"), ixbrl.MakeExplicitMember("ct-comp:DetailedAnalysisDimension", "ct-comp:Item1")}})

	pg := ret.AddPage()
	pg.AddRow("ct-comp:CompanyName", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:CompanyName", Text: g.config.Business.Name})
	pg.AddRow("ct-comp:TaxReference", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:TaxReference", Text: g.config.Utr})
	pg.AddRow("ct-comp:PeriodOfAccountStartDate", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:PeriodOfAccountStartDate", Text: cyStart.IsoDate()})
	pg.AddRow("ct-comp:PeriodOfAccountEndDate", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:PeriodOfAccountEndDate", Text: cyEnd.IsoDate()})
	pg.AddRow("ct-comp:StartOfPeriodCoveredByReturn", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:StartOfPeriodCoveredByReturn", Text: cyStart.IsoDate()})
	pg.AddRow("ct-comp:EndOfPeriodCoveredByReturn", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:EndOfPeriodCoveredByReturn", Text: cyEnd.IsoDate()})
	pg.AddRow("ct-comp:CompanyIsAPartnerInAFirm", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "ct-comp:CompanyIsAPartnerInAFirm", Text: "false"})

	for _, pd := range g.config.CompsPages {
		page := ret.AddPage()
		page.Header = append(page.Header, &ixbrl.Div{Tag: "h1", Nest: &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:CompanyName", Text: g.config.Business.Name}})
		page.Header = append(page.Header, &ixbrl.Div{Nest: &ixbrl.Many{Items: []any{
			&ixbrl.Div{Tag: "span", Text: "Utr "},
			&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:TaxReference", Text: g.config.Utr},
			&ixbrl.Div{Tag: "span", Text: " | Accounting Period: "},
			&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:PeriodOfAccountStartDate", Text: cyStart.UKShortDate(), Format: "ixt2:datedaymonthyear"},
			&ixbrl.Div{Tag: "span", Text: " - "},
			&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:PeriodOfAccountEndDate", Text: cyEnd.UKShortDate(), Format: "ixt2:datedaymonthyear"},
		}}})

		HandlePage(page, &pd, g.config.Ranges, make(map[string]map[string]reporter.Account))
	}

	return ret
}

func ComputationsGenerator(config *config.Configuration, styles string) config.IXBRLGenerator {
	return &GnuCashComputationsIXBRLGenerator{config: config, styles: styles}
}
