package config

import (
	"fmt"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/ixbrl"
)

type GnuCashAccountsIXBRLGenerator struct {
	config *Configuration
	styles string
}

// Generate implements AccountsGenerator.
func (g *GnuCashAccountsIXBRLGenerator) Generate() *ixbrl.IXBRL {
	ret := ixbrl.NewIXBRL(g.config.Business.Name+" - Financial Statements", "https://xbrl.frc.org.uk/FRS-102/2025-01-01/FRS-102-2025-01-01.xsd", g.styles)
	ret.AddSchema("bus", "http://xbrl.frc.org.uk/cd/2025-01-01/business")
	ret.AddSchema("core", "http://xbrl.frc.org.uk/fr/2025-01-01/core")
	ret.AddSchema("uk-bus", "http://www.xbrl.org/uk/cd/business/2009-09-01")

	ret.AddContext(&ixbrl.Context{ID: "CY", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: ixbrl.NewDate(g.config.Ranges["Curr"].Start), ToDate: ixbrl.NewDate(g.config.Ranges["Curr"].End)})
	ret.AddContext(&ixbrl.Context{ID: "CYEnd", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, Instant: ixbrl.NewDate(g.config.Ranges["Curr"].End)})
	ret.AddContext(&ixbrl.Context{ID: "CYAccountsType", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: ixbrl.NewDate(g.config.Ranges["Curr"].Start), ToDate: ixbrl.NewDate(g.config.Ranges["Curr"].End), Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("bus:AccountsTypeDimension", "bus:FullAccounts")}})
	ret.AddContext(&ixbrl.Context{ID: "CYAccountsStatus", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: ixbrl.NewDate(g.config.Ranges["Curr"].Start), ToDate: ixbrl.NewDate(g.config.Ranges["Curr"].End), Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("bus:AccountsStatusDimension", "bus:AuditExempt-NoAccountantsReport")}})
	ret.AddContext(&ixbrl.Context{ID: "CYAccountingStandards", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: ixbrl.NewDate(g.config.Ranges["Curr"].Start), ToDate: ixbrl.NewDate(g.config.Ranges["Curr"].End), Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("bus:AccountingStandardsDimension", "bus:Micro-entities")}})
	ret.AddContext(&ixbrl.Context{ID: "CYLegalFormEntity", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: ixbrl.NewDate(g.config.Ranges["Curr"].Start), ToDate: ixbrl.NewDate(g.config.Ranges["Curr"].End), Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("bus:LegalFormEntityDimension", "bus:PrivateLimitedCompanyLtd")}})
	ret.AddContext(&ixbrl.Context{ID: "CYDirector", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: ixbrl.NewDate(g.config.Ranges["Curr"].Start), ToDate: ixbrl.NewDate(g.config.Ranges["Curr"].End), Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("bus:EntityOfficersDimension", "bus:Director1")}})

	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:NameProductionSoftware", Text: "Ziniki HMRC"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:VersionProductionSoftware", Text: "2026-01-31"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:EntityCurrentLegalOrRegisteredName", Text: g.config.Business.Name})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:UKCompaniesHouseRegisteredNumber", Text: g.config.Business.ID})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "bus:StartDateForPeriodCoveredByReport", Text: g.config.Ranges["Curr"].Start})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "bus:EndDateForPeriodCoveredByReport", Text: g.config.Ranges["Curr"].End})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "bus:BalanceSheetDate", Text: g.config.Ranges["Curr"].End})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "core:DateAuthorisationFinancialStatementsForIssue", Text: g.config.Ranges["Curr"].End})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:EntityDormantTruefalse", Text: "false", Format: "ixt2:booleanfalse"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:DescriptionPrincipalActivities", Text: "No description of principal activity"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:EntityTradingStatus", Format: "ixt2:nocontent"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYAccountsType", Name: "bus:AccountsType", Format: "ixt2:nocontent"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYAccountingStandards", Name: "bus:AccountingStandardsApplied", Format: "ixt2:nocontent"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYAccountsStatus", Name: "bus:AccountsStatusAuditedOrUnaudited", Format: "ixt2:nocontent"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYLegalFormEntity", Name: "bus:LegalFormEntity", Format: "ixt2:nocontent"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYDirector", Name: "core:DirectorSigningFinancialStatements"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYDirector", Name: "bus:NameEntityOfficer", Text: g.config.Business.Contact})

	front := ret.AddPage()
	front.Front = append(front.Front, &ixbrl.Div{Class: "company-name", Text: g.config.Business.Name})
	front.Front = append(front.Front, &ixbrl.Div{Class: "document-type", Text: "Financial Statements"})
	front.Front = append(front.Front, &ixbrl.Div{Class: "period", Text: fmt.Sprintf("For the Year Ended %s", g.config.Ranges["Curr"].End)})

	details := ret.AddPage()
	details.Header = append(details.Header, &ixbrl.Div{Tag: "h1", Text: g.config.Business.Name})
	details.Header = append(details.Header, &ixbrl.Div{Class: "company-details", Text: fmt.Sprintf("Company No. %s", g.config.Business.ID)})
	details.Header = append(details.Header, &ixbrl.Div{Tag: "h2", Text: fmt.Sprintf("Statement of income for the year ended %s", g.config.Ranges["Curr"].End)})

	return ret
}
