package ixbrlgens

import (
	"fmt"
	"log"
	"strconv"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/ixbrl"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/reporter"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/writer"
)

type GnuCashAccountsIXBRLGenerator struct {
	config *config.Configuration
	// acctranges map[string]map[string]reporter.Account

	styles string
}

func (g *GnuCashAccountsIXBRLGenerator) Generate(acctranges map[string]map[string]config.ReporterAccount) *ixbrl.IXBRL {
	ret := ixbrl.NewIXBRL(g.config.Business.Name+" - Financial Statements", "https://xbrl.frc.org.uk/FRS-102/2025-01-01/FRS-102-2025-01-01.xsd", g.styles)
	ret.AddSchema("bus", "http://xbrl.frc.org.uk/cd/2025-01-01/business")
	ret.AddSchema("core", "http://xbrl.frc.org.uk/fr/2025-01-01/core")
	ret.AddSchema("uk-bus", "http://www.xbrl.org/uk/cd/business/2009-09-01")
	ret.AddSchema("direp", "http://xbrl.frc.org.uk/reports/2025-01-01/direp")

	cyStart := ixbrl.NewDate(g.config.Ranges["CY"].Start)
	cyEnd := ixbrl.NewDate(g.config.Ranges["CY"].End)
	pyStart := ixbrl.NewDate(g.config.Ranges["PY"].Start)
	pyEnd := ixbrl.NewDate(g.config.Ranges["PY"].End)

	ret.AddContext(&ixbrl.Context{ID: "CY", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd})
	ret.AddContext(&ixbrl.Context{ID: "PY", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: pyStart, ToDate: pyEnd})
	ret.AddContext(&ixbrl.Context{ID: "CYEnd", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, Instant: cyEnd})
	ret.AddContext(&ixbrl.Context{ID: "PYEnd", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, Instant: pyEnd})
	ret.AddContext(&ixbrl.Context{ID: "CYAccountsType", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd, Segment: []ixbrl.SegmentMember{ixbrl.MakeExplicitMember("bus:AccountsTypeDimension", "bus:FullAccounts")}})
	ret.AddContext(&ixbrl.Context{ID: "CYAccountsStatus", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd, Segment: []ixbrl.SegmentMember{ixbrl.MakeExplicitMember("bus:AccountsStatusDimension", "bus:AuditExempt-NoAccountantsReport")}})
	ret.AddContext(&ixbrl.Context{ID: "CYAccountingStandards", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd, Segment: []ixbrl.SegmentMember{ixbrl.MakeExplicitMember("bus:AccountingStandardsDimension", "bus:Micro-entities")}})
	ret.AddContext(&ixbrl.Context{ID: "CYLegalFormEntity", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd, Segment: []ixbrl.SegmentMember{ixbrl.MakeExplicitMember("bus:LegalFormEntityDimension", "bus:PrivateLimitedCompanyLtd")}})
	ret.AddContext(&ixbrl.Context{ID: "CYDirector", IdentifierScheme: "http://www.companieshouse.gov.uk/", Identifier: g.config.Business.ID, FromDate: cyStart, ToDate: cyEnd, Segment: []ixbrl.SegmentMember{ixbrl.MakeExplicitMember("bus:EntityOfficersDimension", "bus:Director1")}})

	ret.AddUnit(&ixbrl.Unit{ID: "GBP", Measure: "iso4217:GBP"})
	ret.AddUnit(&ixbrl.Unit{ID: "Pure", Measure: "xbrli:pure"})

	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:NameProductionSoftware", Text: "Ziniki HMRC"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:VersionProductionSoftware", Text: "2026-02-14"})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:EntityCurrentLegalOrRegisteredName", Text: g.config.Business.Name})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:UKCompaniesHouseRegisteredNumber", Text: g.config.Business.ID})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "bus:StartDateForPeriodCoveredByReport", Text: cyStart.IsoDate()})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "bus:EndDateForPeriodCoveredByReport", Text: cyEnd.IsoDate()})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "bus:BalanceSheetDate", Text: cyEnd.IsoDate()})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CYEnd", Name: "core:DateAuthorisationFinancialStatementsForIssue", Text: cyEnd.IsoDate()})
	ret.AddHidden(&ixbrl.IXProp{Type: ixbrl.NonFraction, Context: "CY", Name: "core:AverageNumberEmployeesDuringPeriod", Unit: "Pure", Text: strconv.Itoa(g.config.Business.AvgEmployees), Decimals: "0"})
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

	g.GenerateAccountsPages(ret, acctranges)
	dp := ret.AddPage()
	g.DeclarationsPage(dp)

	return ret
}

func (g *GnuCashAccountsIXBRLGenerator) GenerateAccountsPages(ret *ixbrl.IXBRL, acctranges map[string]map[string]config.ReporterAccount) {
	for _, pd := range g.config.Pages {
		page := ret.AddPage()
		page.Header = append(page.Header, &ixbrl.Div{Tag: "h1",
			Nest: &ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:EntityCurrentLegalOrRegisteredName", Text: g.config.Business.Name},
		})
		page.Header = append(page.Header, &ixbrl.Div{Class: "company-details",
			Nest: &ixbrl.Many{Items: []any{
				&ixbrl.Div{Tag: "span", Text: "Company Number: "},
				&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: "bus:UKCompaniesHouseRegisteredNumber", Text: g.config.Business.ID},
				&ixbrl.Div{Tag: "span", Text: " (England and Wales)"},
			}}})

		HandlePage(page, &pd, g.config.Ranges, acctranges)
	}
}

func HandlePage(page *ixbrl.Page, pd *config.PageDefn, ranges map[string]config.DateRange, acctranges map[string]map[string]config.ReporterAccount) {
	if pd.Title != "" {
		title := pd.Title
		if pd.TitleArgs != nil {
			args := MapArgs(ranges, pd.TitleArgs)
			title = fmt.Sprintf(title, args...)
		}
		page.Header = append(page.Header, &ixbrl.Div{Tag: "h1", Text: title})
	}

	for _, r := range pd.Rows {
		var cols []any
		elide := r.ElideIfAllZero
		for _, col := range r.Columns {
			cx := col.Context
			if col.Label != "" {
				cols = append(cols, col.Label)
			} else if col.Date != "" {
				if cx == "" {
					cx = col.Year + "End"
				}
				dr := ranges[col.Year]
				var dy string
				switch col.Scope {
				case "Start":
					dy = dr.Start
				case "End":
					dy = dr.End
				default:
					log.Fatalf("invalid date start/end: %s", col.Scope)
				}
				var fdate string
				var ffmt string
				switch col.DateFormat {
				case "ukfulldate":
					fdate = ixbrl.NewDate(dy).UKFullDate()
					ffmt = "ixt:datelonguk"
				default:
					log.Fatalf("invalid date format: %s", col.DateFormat)
				}
				ixp := &ixbrl.IXProp{Type: ixbrl.NonNumeric, Name: col.Tag, Context: cx, Text: fdate, Format: ffmt}
				cols = append(cols, ixp)
			} else if col.Value != "" {
				if acctranges[col.Year][col.Value] != nil {
					cols = append(cols, &ixbrl.IXProp{Type: ixbrl.NonFraction, Name: col.Tag, Context: col.Year, Unit: col.Unit, Text: acctranges[col.Year][col.Value].Balance().String()})
					elide = false
				} else {
					log.Printf("there is no value for %s for %s", col.Value, col.Year)
				}
			} else if col.GBP != "" {
				if acctranges[col.Year][col.GBP] != nil {
					acct := acctranges[col.Year][col.GBP]
					gbp := acct.Balance().(writer.Money).Units
					var column ixbrl.MakeEtree
					wantNeg := acct.ShowBrackets()
					if gbp != 0 {
						elide = false
					}
					if gbp < 0 {
						wantNeg = !wantNeg
						gbp = -gbp
					}
					if cx == "" {
						cx = col.Year
					}
					if col.Scope == "End" {
						cx = col.Year + "End"
					}
					ixp := &ixbrl.IXProp{Type: ixbrl.NonFraction, Name: col.Tag, Decimals: "0", Context: cx, Unit: "GBP", Text: strconv.Itoa(gbp)}
					column = ixp
					if wantNeg {
						ixp.Sign = "-"
						column = &ixbrl.Div{Tag: "span", Class: "negative", Nest: column}
					}
					cols = append(cols, column)
				} else {
					log.Fatalf("there is no value for %s for %s", col.GBP, col.Year)
				}
			} else {
				panic("not a label, value or GBP")
			}
		}
		if !elide {
			page.AddRow(cols...)
		}
	}
}

func (g *GnuCashAccountsIXBRLGenerator) DeclarationsPage(pg *ixbrl.Page) {
	cyEnd := ixbrl.NewDate(g.config.Ranges["CY"].End)

	pg.Header = append(pg.Header, &ixbrl.Div{Tag: "h2", Text: "Notes to the financial statements"})
	pg.AddRow("Company Details")
	pg.AddRow(fmt.Sprintf("%s, incorporated in England and Wales, registration number %s, is a private company limited by shares.", g.config.Business.Name, g.config.Business.ID))
	g.Statement(pg, "direp:StatementThatAccountsHaveBeenPreparedInAccordanceWithProvisionsSmallCompaniesRegime", "The accounts have been prepared in accordance with the micro-entity provisions and have been delivered in accordance with the provisions applicable to companies subject to the small companies regime.")
	g.Statement(pg, "direp:StatementThatCompanyEntitledToExemptionFromAuditUnderSection477CompaniesAct2006RelatingToSmallCompanies", fmt.Sprintf("For the year ended %s the company was entitled to exemption from audit under section 477 of the Companies Act 2006 relating to small companies.", cyEnd.UKFullDate()))
	g.Statement(pg, "direp:StatementThatDirectorsAcknowledgeTheirResponsibilitiesUnderCompaniesAct", "The directors acknowledge their responsibilities for complying with the requirements of the Companies Act 2006 with respect to accounting records and the preparation of accounts.")
	g.Statement(pg, "direp:StatementThatMembersHaveNotRequiredCompanyToObtainAnAudit", "The members have not required the company to obtain an audit of its accounts for the year in question in accordance with section 476 of the Companies Act 2006.")
}

func (g *GnuCashAccountsIXBRLGenerator) Statement(pg *ixbrl.Page, code string, msg string) {
	pg.AddRow(&ixbrl.IXProp{Type: ixbrl.NonNumeric, Context: "CY", Name: code, Text: msg})
}

func MapArgs(ranges map[string]config.DateRange, args []config.ArgDefn) []any {
	ret := []any{}
	for _, a := range args {
		if a.Year != "" {
			rng := ranges[a.Year]
			var dt ixbrl.Date
			switch a.Scope {
			case "Start":
				dt = ixbrl.NewDate(rng.Start)
			case "End":
				dt = ixbrl.NewDate(rng.End)
			default:
				panic(fmt.Sprintf("unrecognized scope: %s", a.Scope))
			}
			switch a.Format {
			case "UKFull":
				ret = append(ret, dt.UKFullDate())
			default:
				panic(fmt.Sprintf("Unrecognized format: %s", a.Format))
			}
		}
	}
	return ret
}

func AccountsGenerator(config *config.Configuration, styles string) config.IXBRLGenerator {
	return &GnuCashAccountsIXBRLGenerator{config: config, styles: styles}
}

type Compiler struct {
	Accounts map[string]config.ReporterAccount
}

func (c *Compiler) Configure(fy config.DateRange, accts []config.Account) {
	yr, err := strconv.Atoi(fy.End[0:4])
	if err != nil {
		panic(err)
	}

	for _, acc := range accts {
		c.Accounts[acc.Name] = reporter.MakeAccount(yr, acc.Type)
		c.Configure(fy, acc.Accounts)
	}
}

func (c *Compiler) Credit(ac writer.AccountCredit) {
	c.Accounts[ac.Acct].Credit(ac.When, ac.Amount)
	// log.Printf("%s: Credit %s with %s ... now %v", ac.When.JustDate(), ac.Acct, ac.Amount, c.Accounts[ac.Acct].Balance())
}

func (c *Compiler) Debit(ad writer.AccountDebit) {
	c.Accounts[ad.Acct].Debit(ad.When, ad.Amount)
	// log.Printf("%s: Debit %s with %s ... now %v\n", ad.When.JustDate(), ad.Acct, ad.Amount, c.Accounts[ad.Acct].Balance())
}

func (c *Compiler) DoCalculations(calculations []config.Calculation) {
	for _, calc := range calculations {
		acct := calc.AssignTo
		if c.Accounts[acct] != nil {
			panic(fmt.Sprintf("duplicate acct in calculation: %s", acct))
		}
		ty, total := c.processItems(acct, calc.Type, writer.Money{}, 1, calc.Add)
		_, total = c.processItems(acct, invert(ty), total, -1, calc.Subtract)
		if calc.Floor != nil {
			total.FloorAt(*calc.Floor)
			log.Printf("have floor %f, %s", *calc.Floor, total)
		}
		if calc.Scale != nil {
			total.ScaleBy(*calc.Scale)
			log.Printf("have scale %f %s", *calc.Scale, total)
		}
		c.Accounts[acct] = CalcAccount{ty: ty, balance: total}
	}
}

func (c *Compiler) processItems(acct string, ty string, total writer.Money, pm int, accts []string) (string, writer.Money) {
	for _, ac := range accts {
		adding := c.Accounts[ac]
		if adding == nil {
			panic(fmt.Sprintf("in calc %s, there is no account %s", acct, ac))
		}
		if ty == "" {
			ty = adding.Type()
		} else if ty != adding.Type() {
			panic(fmt.Sprintf("in calc %s, there are mismatched types %s and %s", acct, ty, adding.Type()))
		}
		total.Incorporate(pm, adding.Balance().(writer.Money))
	}
	return ty, total
}

func invert(ty string) string {
	switch ty {
	case "INCOME":
		return "EXPENSE"
	case "EXPENSE":
		return "INCOME"
	case "BANK":
		return "LIABILITY"
	case "ASSET":
		return "LIABILITY"
	case "LIABILITY":
		return "ASSET"
	default:
		panic(fmt.Sprintf("invalid type to invert: %s", ty))
	}
}

type CalcAccount struct {
	ty      string
	balance writer.Money
}

func (c CalcAccount) Balance() config.MyMoney {
	return c.balance
}

func (c CalcAccount) Credit(date config.ADate, amount config.MyMoney) {
	panic("unimplemented")
}

func (c CalcAccount) Debit(date config.ADate, amount config.MyMoney) {
	panic("unimplemented")
}

func (c CalcAccount) HasBalance() bool {
	panic("unimplemented")
}

func (c CalcAccount) IsPL() bool {
	panic("unimplemented")
}

func (c CalcAccount) PLEffect() int {
	panic("unimplemented")
}

func (c CalcAccount) Type() string {
	return c.ty
}

func (c CalcAccount) ShowBrackets() bool {
	return c.ty == "EXPENSE" || c.ty == "LIABILITY" || c.ty == "EQUITY"
}
