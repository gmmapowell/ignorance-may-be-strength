package ixbrlgens

import (
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/ixbrl"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
)

type GnuCashComputationsIXBRLGenerator struct {
	config *config.Configuration
	styles string
}

func (g *GnuCashComputationsIXBRLGenerator) Generate(acctranges map[string]map[string]config.ReporterAccount) *ixbrl.IXBRL {
	ret := ixbrl.NewIXBRL(g.config.Business.Name+" - Tax Computations", "http://www.hmrc.gov.uk/schemas/ct/comp/2024-01-01/ct-comp-2024.xsd", g.styles)
	ret.AddSchema("ct", "http://www.govtalk.gov.uk/taxation/CT/5")
	ret.AddSchema("ct-comp", "http://www.hmrc.gov.uk/schemas/ct/comp/2024-01-01")
	ret.AddSchema("uk-core", "http://xbrl.frc.org.uk/cd/2026-01-01/business")

	ret.AddUnit(&ixbrl.Unit{ID: "GBP", Measure: "iso4217:GBP"})

	cyStart := ixbrl.NewDate(g.config.Ranges["CY"].Start)
	cyEnd := ixbrl.NewDate(g.config.Ranges["CY"].End)

	ret.AddContext(&ixbrl.Context{ID: "CYEnd", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, Instant: cyEnd, Segment: []ixbrl.SegmentMember{ixbrl.MakeExplicitMember("ct-comp:BusinessTypeDimension", "ct-comp:Company"), ixbrl.MakeExplicitMember("ct-comp:DetailedAnalysisDimension", "ct-comp:Item1")}})
	ret.AddContext(&ixbrl.Context{ID: "CY", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd, Segment: []ixbrl.SegmentMember{ixbrl.MakeExplicitMember("ct-comp:BusinessTypeDimension", "ct-comp:Company"), ixbrl.MakeExplicitMember("ct-comp:DetailedAnalysisDimension", "ct-comp:Item1")}})
	ret.AddContext(&ixbrl.Context{ID: "CYBus", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd, Segment: []ixbrl.SegmentMember{ixbrl.MakeExplicitMember("ct-comp:BusinessTypeDimension", "ct-comp:Trade"), ixbrl.MakeExplicitMember("ct-comp:TerritoryDimension", "ct-comp:UK"), ixbrl.MakeTypedMember("ct-comp:BusinessNameDimension", "ct-comp:BusinessNameDomain", g.config.Business.Name)}})

	front := ret.AddPage()
	front.Front = append(front.Front, &ixbrl.Div{Class: "company-name", Tag: "h1", Nest: &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:CompanyName", Text: g.config.Business.Name}})
	front.Front = append(front.Front, &ixbrl.Div{Class: "company-utr", Text: "Utr:", Nest: &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:TaxReference", Text: g.config.Utr}})
	front.Front = append(front.Front, &ixbrl.Div{Class: "company-acct-dates", Text: "Start date of accounts:", Nest: &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:PeriodOfAccountStartDate", Text: cyStart.UKFullDate(), Format: "ixt:datelonguk"}})
	front.Front = append(front.Front, &ixbrl.Div{Class: "company-acct-dates", Text: "End date of accounts:", Nest: &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:PeriodOfAccountEndDate", Text: cyEnd.UKFullDate(), Format: "ixt:datelonguk"}})
	front.Front = append(front.Front, &ixbrl.Div{Class: "company-acct-dates", Text: "Start of period covered by return:", Nest: &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:StartOfPeriodCoveredByReturn", Text: cyStart.UKFullDate(), Format: "ixt:datelonguk"}})
	front.Front = append(front.Front, &ixbrl.Div{Class: "company-acct-dates", Text: "End of period covered by return:", Nest: &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:EndOfPeriodCoveredByReturn", Text: cyEnd.UKFullDate(), Format: "ixt:datelonguk"}})
	front.Front = append(front.Front, &ixbrl.Div{Class: "company-not-partner", Text: "Company is not a partner in a larger firm", Nest: &ixbrl.Div{Class: "hidden", Nest: &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "ct-comp:CompanyIsAPartnerInAFirm", Text: "false"}}})

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

		HandlePage(page, &pd, g.config.Ranges, acctranges)
	}

	return ret
}

func ComputationsGenerator(config *config.Configuration, styles string) config.IXBRLGenerator {
	return &GnuCashComputationsIXBRLGenerator{config: config, styles: styles}
}
