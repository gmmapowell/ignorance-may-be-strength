package config

import (
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/ixbrl"
)

type GnuCashComputationsIXBRLGenerator struct {
	config *Configuration
	utr    string // because we need a specific UTR for testing
}

func (g *GnuCashComputationsIXBRLGenerator) Generate() *ixbrl.IXBRL {
	ret := ixbrl.NewIXBRL(g.config.Business.Name+" - Tax Computations", "http://www.hmrc.gov.uk/schemas/ct/comp/2024-01-01/ct-comp-2024.xsd")
	ret.AddSchema("ct-comp", "http://www.hmrc.gov.uk/schemas/ct/comp/2024-01-01")
	ret.AddContext(&ixbrl.Context{ID: "CYEnd", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, Instant: ixbrl.NewDate(g.config.Ranges["Curr"].End), Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("ct-comp:BusinessTypeDimension", "ct-comp:Company"), ixbrl.MakeExplicitMember("ct-comp:DetailedAnalysisDimension", "ct-comp:Item1")}})
	ret.AddContext(&ixbrl.Context{ID: "CY", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: ixbrl.NewDate(g.config.Ranges["Curr"].Start), ToDate: ixbrl.NewDate(g.config.Ranges["Curr"].End), Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("ct-comp:BusinessTypeDimension", "ct-comp:Company"), ixbrl.MakeExplicitMember("ct-comp:DetailedAnalysisDimension", "ct-comp:Item1")}})
	pg := ret.AddPage()
	pg.AddRow("ct-comp:CompanyName", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:CompanyName", Text: g.config.Business.Name})
	pg.AddRow("ct-comp:TaxReference", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:TaxReference", Text: g.utr})
	pg.AddRow("ct-comp:PeriodOfAccountStartDate", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:PeriodOfAccountStartDate", Text: g.config.Ranges["Curr"].Start})
	pg.AddRow("ct-comp:PeriodOfAccountEndDate", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:PeriodOfAccountEndDate", Text: g.config.Ranges["Curr"].End})
	pg.AddRow("ct-comp:StartOfPeriodCoveredByReturn", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:StartOfPeriodCoveredByReturn", Text: g.config.Ranges["Curr"].Start})
	pg.AddRow("ct-comp:EndOfPeriodCoveredByReturn", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:EndOfPeriodCoveredByReturn", Text: g.config.Ranges["Curr"].End})
	pg.AddRow("ct-comp:CompanyIsAPartnerInAFirm", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "ct-comp:CompanyIsAPartnerInAFirm", Text: "false"})
	return ret
}
