package config

import (
	"github.com/gmmapowell/ignorance/accounts/internal/ct600/ixbrl"
)

type GnuCashComputationsIXBRLGenerator struct {
	config *Configuration
}

func (g *GnuCashComputationsIXBRLGenerator) Generate() *ixbrl.IXBRL {
	ret := ixbrl.NewIXBRL(g.config.Business.Name+" - Tax Computations", "http://www.hmrc.gov.uk/schemas/ct/comp/2024-01-01/ct-comp-2024.xsd")
	ret.AddSchema("ct-comp", "http://www.hmrc.gov.uk/schemas/ct/comp/2024-01-01")
	ret.AddContext(&ixbrl.Context{ID: "CYEnd", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, Instant: ixbrl.NewDate(g.config.Ranges["Curr"].End)})
	pg := ret.AddPage()
	pg.AddRow("ct-comp:PeriodOfAccountStartDate", &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "ct-comp:PeriodOfAccountStartDate", Text: g.config.Ranges["Curr"].Start})
	// ret.AddSchema("core", "http://xbrl.frc.org.uk/fr/2025-01-01/core")
	// ret.AddSchema("uk-bus", "http://www.xbrl.org/uk/cd/business/2009-09-01")
	// ret.AddContext(&ixbrl.Context{ID: "CY", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: ixbrl.NewDate(g.config.Ranges["Curr"].Start), ToDate: ixbrl.NewDate(g.config.Ranges["Curr"].End)})
	// ret.AddContext(&ixbrl.Context{ID: "CYAccountsType", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: ixbrl.NewDate(g.config.Ranges["Curr"].Start), ToDate: ixbrl.NewDate(g.config.Ranges["Curr"].End), Segment: ixbrl.ExplicitMember("bus:AccountsTypeDimension", "bus:FullAccounts")})
	// ret.AddContext(&ixbrl.Context{ID: "CYAccountingStandards", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: ixbrl.NewDate(g.config.Ranges["Curr"].Start), ToDate: ixbrl.NewDate(g.config.Ranges["Curr"].End), Segment: ixbrl.ExplicitMember("bus:AccountingStandardsDimension", "bus:Micro-entities")})
	// ret.AddContext(&ixbrl.Context{ID: "CYLegalFormEntity", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: ixbrl.NewDate(g.config.Ranges["Curr"].Start), ToDate: ixbrl.NewDate(g.config.Ranges["Curr"].End), Segment: ixbrl.ExplicitMember("bus:LegalFormEntityDimension", "bus:PrivateLimitedCompanyLtd")})
	// ret.AddContext(&ixbrl.Context{ID: "CYAccountsStatus", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: ixbrl.NewDate(g.config.Ranges["Curr"].Start), ToDate: ixbrl.NewDate(g.config.Ranges["Curr"].End), Segment: ixbrl.ExplicitMember("bus:AccountsStatusDimension", "bus:AuditExempt-NoAccountantsReport")})
	// ret.AddContext(&ixbrl.Context{ID: "CYDirector", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: ixbrl.NewDate(g.config.Ranges["Curr"].Start), ToDate: ixbrl.NewDate(g.config.Ranges["Curr"].End), Segment: ixbrl.ExplicitMember("bus:EntityOfficersDimension", "bus:Director1")})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:NameProductionSoftware", Text: "Ziniki HMRC"})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:VersionProductionSoftware", Text: "2026-01-31"})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:EntityCurrentLegalOrRegisteredName", Text: g.config.Business.Name})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:UKCompaniesHouseRegisteredNumber", Text: g.config.Business.ID})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "bus:StartDateForPeriodCoveredByReport", Text: g.config.Ranges["Curr"].Start})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "bus:EndDateForPeriodCoveredByReport", Text: g.config.Ranges["Curr"].End})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "bus:BalanceSheetDate", Text: g.config.Ranges["Curr"].End})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "core:DateAuthorisationFinancialStatementsForIssue", Text: g.config.Ranges["Curr"].End})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:EntityDormantTruefalse", Text: "false", Format: "ixt2:booleanfalse"})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:DescriptionPrincipalActivities", Text: "No description of principal activity"})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:EntityTradingStatus", Format: "ixt2:nocontent"})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYAccountsType", Name: "bus:AccountsType", Format: "ixt2:nocontent"})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYAccountingStandards", Name: "bus:AccountingStandardsApplied", Format: "ixt2:nocontent"})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYAccountsStatus", Name: "bus:AccountsStatusAuditedOrUnaudited", Format: "ixt2:nocontent"})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYLegalFormEntity", Name: "bus:LegalFormEntity", Format: "ixt2:nocontent"})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYDirector", Name: "core:DirectorSigningFinancialStatements"})
	// ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYDirector", Name: "bus:NameEntityOfficer", Text: g.config.Business.Contact})
	return ret
}
