package ixbrlgens

import (
	"fmt"
	"log"
	"strconv"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/ixbrl"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/accounts"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/reporter"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/sheets"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/writer"
)

type GnuCashAccountsIXBRLGenerator struct {
	config     *config.Configuration
	acctranges map[string]map[string]reporter.Account

	styles string
}

func (g *GnuCashAccountsIXBRLGenerator) Generate() *ixbrl.IXBRL {
	ret := ixbrl.NewIXBRL(g.config.Business.Name+" - Financial Statements", "https://xbrl.frc.org.uk/FRS-102/2025-01-01/FRS-102-2025-01-01.xsd", g.styles)
	ret.AddSchema("bus", "http://xbrl.frc.org.uk/cd/2025-01-01/business")
	ret.AddSchema("core", "http://xbrl.frc.org.uk/fr/2025-01-01/core")
	ret.AddSchema("uk-bus", "http://www.xbrl.org/uk/cd/business/2009-09-01")

	cyStart := ixbrl.NewDate(g.config.Ranges["CY"].Start)
	cyEnd := ixbrl.NewDate(g.config.Ranges["CY"].End)
	pyStart := ixbrl.NewDate(g.config.Ranges["PY"].Start)
	pyEnd := ixbrl.NewDate(g.config.Ranges["PY"].End)

	ret.AddContext(&ixbrl.Context{ID: "CY", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd})
	ret.AddContext(&ixbrl.Context{ID: "PY", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: pyStart, ToDate: pyEnd})
	ret.AddContext(&ixbrl.Context{ID: "CYEnd", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, Instant: cyEnd})
	ret.AddContext(&ixbrl.Context{ID: "CYAccountsType", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd, Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("bus:AccountsTypeDimension", "bus:FullAccounts")}})
	ret.AddContext(&ixbrl.Context{ID: "CYAccountsStatus", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd, Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("bus:AccountsStatusDimension", "bus:AuditExempt-NoAccountantsReport")}})
	ret.AddContext(&ixbrl.Context{ID: "CYAccountingStandards", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd, Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("bus:AccountingStandardsDimension", "bus:Micro-entities")}})
	ret.AddContext(&ixbrl.Context{ID: "CYLegalFormEntity", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd, Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("bus:LegalFormEntityDimension", "bus:PrivateLimitedCompanyLtd")}})
	ret.AddContext(&ixbrl.Context{ID: "CYDirector", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd, Segment: []*ixbrl.ExplicitMember{ixbrl.MakeExplicitMember("bus:EntityOfficersDimension", "bus:Director1")}})

	ret.AddUnit(&ixbrl.Unit{ID: "GBP", Measure: "iso4217:GBP"})

	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:NameProductionSoftware", Text: "Ziniki HMRC"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:VersionProductionSoftware", Text: "2026-01-31"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:EntityCurrentLegalOrRegisteredName", Text: g.config.Business.Name})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:UKCompaniesHouseRegisteredNumber", Text: g.config.Business.ID})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "bus:StartDateForPeriodCoveredByReport", Text: cyStart.IsoDate()})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "bus:EndDateForPeriodCoveredByReport", Text: cyEnd.IsoDate()})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "bus:BalanceSheetDate", Text: cyEnd.IsoDate()})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "core:DateAuthorisationFinancialStatementsForIssue", Text: cyEnd.IsoDate()})
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
	front.Front = append(front.Front, &ixbrl.Div{Class: "period", Text: fmt.Sprintf("For the Year Ended %s", cyEnd.IsoDate())})

	details := ret.AddPage()
	details.Header = append(details.Header, &ixbrl.Div{Tag: "h1", Text: g.config.Business.Name})
	details.Header = append(details.Header, &ixbrl.Div{Class: "company-details", Text: fmt.Sprintf("Company No. %s", g.config.Business.ID)})
	details.Header = append(details.Header, &ixbrl.Div{Tag: "h2", Text: fmt.Sprintf("Statement of income for the year ended %s", cyEnd.UKFullDate())})

	w := writer.MakeWriter(g.config)
	accts := accounts.MakeAccounts(g.config, w)
	sheets.ReadSpreadsheet(g.config, accts)

	g.acctranges = make(map[string]map[string]reporter.Account)
	for name, fy := range g.config.Ranges {
		compiler := &Compiler{accounts: make(map[string]reporter.Account)}
		compiler.Configure(fy, g.config.Accounts)
		accts.Regurgitate(compiler)

		g.acctranges[name] = compiler.accounts
	}

	g.GenerateAccountsPages(ret)

	return ret
}

func (g *GnuCashAccountsIXBRLGenerator) GenerateAccountsPages(ret *ixbrl.IXBRL) {
	for fy, accts := range g.acctranges {
		fmt.Printf("FY %s\n", fy)
		for acctName, acct := range accts {
			fmt.Printf("  Acct %s %s %v\n", acctName, acct.Type(), acct.Balance())
		}
	}
	for _, pd := range g.config.Pages {
		page := ret.AddPage()
		if pd.Title != "" {
			page.Header = append(page.Header, &ixbrl.Div{Tag: "h1", Text: pd.Title})
		}

		for _, r := range pd.Rows {
			var cols []any
			for _, col := range r.Columns {
				if col.Label != "" {
					cols = append(cols, col.Label)
				} else if col.Value != "" {
					if g.acctranges[col.Year][col.Value] != nil {
						cols = append(cols, &ixbrl.IXProp{Type: ixbrl.NonFraction, Name: col.Tag, Context: col.Year, Unit: col.Unit, Text: g.acctranges[col.Year][col.Value].Balance().String()})
					} else {
						log.Printf("there is no value for %s for %s", col.Value, col.Year)
					}
				} else if col.GBP != "" {
					if g.acctranges[col.Year][col.GBP] != nil {
						cols = append(cols, &ixbrl.IXProp{Type: ixbrl.NonFraction, Name: col.Tag, Decimals: "0", Context: col.Year, Unit: "GBP", Text: strconv.Itoa(g.acctranges[col.Year][col.GBP].Balance().Units)})
					} else {
						log.Printf("there is no value for %s for %s", col.GBP, col.Year)
					}
				} else {
					panic("not a label, value or GBP")
				}
			}
			page.AddRow(cols...)
		}
	}
}

func AccountsGenerator(config *config.Configuration, styles string) config.IXBRLGenerator {
	return &GnuCashAccountsIXBRLGenerator{config: config, styles: styles}
}

type Compiler struct {
	accounts map[string]reporter.Account
}

func (c *Compiler) Configure(fy config.DateRange, accts []config.Account) {
	yr, err := strconv.Atoi(fy.End[0:4])
	if err != nil {
		panic(err)
	}

	for _, acc := range accts {
		c.accounts[acc.Name] = reporter.MakeAccount(yr, acc.Type)
		c.Configure(fy, acc.Accounts)
	}
}

func (c *Compiler) Credit(ac writer.AccountCredit) {
	c.accounts[ac.Acct].Credit(ac.When, ac.Amount)
}

func (c *Compiler) Debit(ad writer.AccountDebit) {
	c.accounts[ad.Acct].Debit(ad.When, ad.Amount)
}
