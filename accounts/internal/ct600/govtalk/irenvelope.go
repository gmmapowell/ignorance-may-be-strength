package govtalk

import (
	"fmt"
	"log"

	"github.com/gmmapowell/ignorance/accounts/internal/ct600/xml"
	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/unix-world/smartgoext/xml-utils/etree"
)

type IRenvelope struct {
	Business   config.Business
	UTR        string
	ReturnType string

	PeriodStart string
	PeriodEnd   string
	Sender      string

	Turnover             float64
	TradingProfits       float64
	LossesBroughtForward float64
	TradingNetProfits    float64
	CorporationTax       float64

	NoAccountsReason      string
	AccountsIXBRL         string
	AccountsGenerator     config.IXBRLGenerator
	NoComputationsReason  string
	ComputationIXBRL      string
	ComputationsGenerator config.IXBRLGenerator
}

func (ire *IRenvelope) AsXML() *etree.Element {
	ac := 0
	if ire.NoAccountsReason != "" {
		ac++
	}
	if ire.AccountsIXBRL != "" {
		ac++
	}
	if ire.AccountsGenerator != nil {
		ac++
	}
	if ac == 0 {
		log.Fatalf("Must give accounts or a reason not to")
	}
	if ac > 1 {
		log.Fatalf("Must EITHER give accounts OR a reason not to")
	}
	cc := 0
	if ire.NoComputationsReason != "" {
		cc++
	}
	if ire.ComputationIXBRL != "" {
		cc++
	}
	if ire.ComputationsGenerator != nil {
		cc++
	}
	if cc == 0 {
		log.Fatalf("Must give computations or a reason not to")
	}
	if cc > 1 {
		log.Fatalf("Must EITHER give computations OR a reason not to")
	}
	keys := xml.ElementWithNesting("Keys", xml.Key("UTR", ire.UTR))
	pe := xml.ElementWithText("PeriodEnd", ire.PeriodEnd)
	dc := xml.ElementWithText("DefaultCurrency", "GBP")
	manifest := xml.ElementWithNesting("Manifest",
		xml.ElementWithNesting("Contains",
			xml.ElementWithNesting("Reference",
				xml.ElementWithText("Namespace", "http://www.govtalk.gov.uk/taxation/CT/5"),
				xml.ElementWithText("SchemaVersion", "2022-v1.99"),
				xml.ElementWithText("TopElementName", "CompanyTaxReturn"),
			)))
	irh := xml.ElementWithNesting("IRheader", keys, pe, dc, manifest, xml.ElementWithText("Sender", ire.Sender))
	ci := xml.ElementWithNesting("CompanyInformation", companyInfo(ire.Business, ire.UTR, ire.PeriodStart, ire.PeriodEnd)...)
	summary := xml.ElementWithNesting("ReturnInfoSummary", ire.accounts(), ire.computations())
	turnover := xml.ElementWithNesting("Turnover", xml.ElementWithText("Total", fmt.Sprintf("%.2f", ire.Turnover)))
	calc := xml.ElementWithNesting("CompanyTaxCalculation", ire.taxCalc()...)
	too := xml.ElementWithNesting("CalculationOfTaxOutstandingOrOverpaid", ire.cotoo()...)
	decl := xml.ElementWithNesting("Declaration", decl()...)
	attachments := ire.figureAttachments()
	var attach *etree.Element
	if attachments != nil {
		attach = xml.ElementWithNesting("AttachedFiles", attachments)
	}
	ctr := xml.MakeCompanyTaxReturn(ire.ReturnType, ci, summary, turnover, calc, too, decl, attach)
	return xml.MakeIRenvelopeMessage(irh, ctr)
}

func companyInfo(business config.Business, UTR, start, end string) []etree.Token {
	return []etree.Token{
		xml.ElementWithText("CompanyName", business.Name),
		xml.ElementWithText("RegistrationNumber", business.ID),
		xml.ElementWithText("Reference", UTR),
		xml.ElementWithText("CompanyType", business.CompanyType),
		xml.ElementWithNesting("PeriodCovered",
			xml.ElementWithText("From", start),
			xml.ElementWithText("To", end),
		),
	}
}

func (ire *IRenvelope) accounts() *etree.Element {
	if ire.NoAccountsReason != "" {
		return xml.ElementWithNesting("Accounts", xml.ElementWithText("NoAccountsReason", ire.NoAccountsReason))
	} else {
		return xml.ElementWithNesting("Accounts", xml.ElementWithText("ThisPeriodAccounts", "yes"))
	}
}

func (ire *IRenvelope) computations() *etree.Element {
	if ire.NoComputationsReason != "" {
		return xml.ElementWithNesting("Computations", xml.ElementWithText("NoComputationsReason", ire.NoComputationsReason))
	} else {
		return xml.ElementWithNesting("Computations", xml.ElementWithText("ThisPeriodComputations", "yes"))
	}
}

func (ire *IRenvelope) taxCalc() []etree.Token {
	return []etree.Token{
		xml.ElementWithNesting("Income",
			xml.ElementWithNesting("Trading",
				xml.ElementWithText("Profits", fmt.Sprintf("%.2f", ire.TradingProfits)),
				// if ire.LossesBroughtForward > 0 {
				// xml.ElementWithText("LossesBroughtForward", fmt.Sprintf("%.2f", ire.LossesBroughtForward)),
				// }
				xml.ElementWithText("NetProfits", fmt.Sprintf("%.2f", ire.TradingNetProfits)),
			),
		),
		xml.ElementWithText("ProfitsBeforeOtherDeductions", fmt.Sprintf("%.2f", ire.TradingProfits)),
		xml.ElementWithNesting("ChargesAndReliefs", xml.ElementWithText("ProfitsBeforeDonationsAndGroupRelief", fmt.Sprintf("%.2f", ire.TradingProfits))),
		xml.ElementWithText("ChargeableProfits", fmt.Sprintf("%.2f", ire.TradingProfits)),
		xml.ElementWithText("CorporationTax", fmt.Sprintf("%.2f", ire.CorporationTax)),
		xml.ElementWithText("NetCorporationTaxChargeable", fmt.Sprintf("%.2f", ire.CorporationTax)),
	}
}

func (ire *IRenvelope) cotoo() []etree.Token {
	return []etree.Token{
		xml.ElementWithText("NetCorporationTaxLiability", fmt.Sprintf("%.2f", ire.CorporationTax)),
		xml.ElementWithText("TaxChargeable", fmt.Sprintf("%.2f", ire.CorporationTax)),
		xml.ElementWithText("TaxPayable", fmt.Sprintf("%.2f", ire.CorporationTax)),
	}
}

func decl() []etree.Token {
	return []etree.Token{
		xml.ElementWithText("AcceptDeclaration", "yes"),
		xml.ElementWithText("Name", "Test"),
		xml.ElementWithText("Status", "Test"),
	}
}

func (ire *IRenvelope) figureAttachments() *etree.Element {
	ret := []etree.Token{}
	if ire.ComputationIXBRL != "" {
		cxml := xml.ElementWithNesting("Computation", xml.ElementWithNesting("Instance", xml.ElementWithNesting("InlineXBRLDocument", xml.ContentFromFile(ire.ComputationIXBRL))))
		ret = append(ret, cxml)
	}
	if ire.ComputationsGenerator != nil {
		compsXML := ire.ComputationsGenerator.Generate().AsEtree()
		xml.WriteEtree("comps.xhtml", compsXML)
		acxml := xml.ElementWithNesting("Computation", xml.ElementWithNesting("Instance", xml.ElementWithNesting("InlineXBRLDocument", compsXML)))
		ret = append(ret, acxml)
	}
	if ire.AccountsIXBRL != "" {
		acxml := xml.ElementWithNesting("Accounts", xml.ElementWithNesting("Instance", xml.ElementWithNesting("InlineXBRLDocument", xml.ContentFromFile(ire.AccountsIXBRL))))
		ret = append(ret, acxml)
	}
	if ire.AccountsGenerator != nil {
		accountsXML := ire.AccountsGenerator.Generate().AsEtree()
		xml.WriteEtree("accounts.xhtml", accountsXML)
		acxml := xml.ElementWithNesting("Accounts", xml.ElementWithNesting("Instance", xml.ElementWithNesting("InlineXBRLDocument", accountsXML)))
		ret = append(ret, acxml)
	}
	return xml.ElementWithNesting("XBRLsubmission", ret...)
}
