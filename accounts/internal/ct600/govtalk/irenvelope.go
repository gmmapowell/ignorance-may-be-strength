package govtalk

import (
	"fmt"
	"log"

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

	NoAccountsReason     string
	AccountsIXBRL        string
	NoComputationsReason string
	ComputationIXBRL     string
}

func (ire *IRenvelope) AsXML() *etree.Element {
	if ire.NoAccountsReason == "" && ire.AccountsIXBRL == "" {
		log.Fatalf("Must give accounts or a reason not to")
	}
	if ire.NoAccountsReason != "" && ire.AccountsIXBRL != "" {
		log.Fatalf("Must EITHER give accounts OR a reason not to")
	}
	if ire.NoComputationsReason == "" && ire.ComputationIXBRL == "" {
		log.Fatalf("Must give computations or a reason not to")
	}
	if ire.NoComputationsReason != "" && ire.ComputationIXBRL != "" {
		log.Fatalf("Must EITHER give computations OR a reason not to")
	}
	keys := ElementWithNesting("Keys", Key("UTR", ire.UTR))
	pe := ElementWithText("PeriodEnd", ire.PeriodEnd)
	dc := ElementWithText("DefaultCurrency", "GBP")
	manifest := ElementWithNesting("Manifest",
		ElementWithNesting("Contains",
			ElementWithNesting("Reference",
				ElementWithText("Namespace", "http://www.govtalk.gov.uk/taxation/CT/5"),
				ElementWithText("SchemaVersion", "2022-v1.99"),
				ElementWithText("TopElementName", "CompanyTaxReturn"),
			)))
	irh := ElementWithNesting("IRheader", keys, pe, dc, manifest, ElementWithText("Sender", ire.Sender))
	ci := ElementWithNesting("CompanyInformation", companyInfo(ire.Business, ire.UTR, ire.PeriodStart, ire.PeriodEnd)...)
	summary := ElementWithNesting("ReturnInfoSummary", ire.accounts(), ire.computations())
	turnover := ElementWithNesting("Turnover", ElementWithText("Total", fmt.Sprintf("%.2f", ire.Turnover)))
	calc := ElementWithNesting("CompanyTaxCalculation", ire.taxCalc()...)
	too := ElementWithNesting("CalculationOfTaxOutstandingOrOverpaid", ire.cotoo()...)
	decl := ElementWithNesting("Declaration", decl()...)
	attachments := ire.figureAttachments()
	var attach *etree.Element
	if attachments != nil {
		attach = ElementWithNesting("AttachedFiles", attachments)
	}
	ctr := MakeCompanyTaxReturn(ire.ReturnType, ci, summary, turnover, calc, too, decl, attach)
	return MakeIRenvelopeMessage(irh, ctr)
}

func companyInfo(business config.Business, UTR, start, end string) []etree.Token {
	return []etree.Token{
		ElementWithText("CompanyName", business.Name),
		ElementWithText("RegistrationNumber", business.ID),
		ElementWithText("Reference", UTR),
		ElementWithText("CompanyType", business.CompanyType),
		ElementWithNesting("PeriodCovered",
			ElementWithText("From", start),
			ElementWithText("To", end),
		),
	}
}

func (ire *IRenvelope) accounts() *etree.Element {
	if ire.NoAccountsReason != "" {
		return ElementWithNesting("Accounts", ElementWithText("NoAccountsReason", ire.NoAccountsReason))
	} else {
		return ElementWithNesting("Accounts", ElementWithText("ThisPeriodAccounts", "yes"))
	}
}

func (ire *IRenvelope) computations() *etree.Element {
	if ire.NoComputationsReason != "" {
		return ElementWithNesting("Computations", ElementWithText("NoComputationsReason", ire.NoComputationsReason))
	} else {
		return ElementWithNesting("Computations", ElementWithText("ThisPeriodComputations", "yes"))
	}
}

func (ire *IRenvelope) taxCalc() []etree.Token {
	return []etree.Token{
		ElementWithNesting("Income",
			ElementWithNesting("Trading",
				ElementWithText("Profits", fmt.Sprintf("%.2f", ire.TradingProfits)),
				// if ire.LossesBroughtForward > 0 {
				// ElementWithText("LossesBroughtForward", fmt.Sprintf("%.2f", ire.LossesBroughtForward)),
				// }
				ElementWithText("NetProfits", fmt.Sprintf("%.2f", ire.TradingNetProfits)),
			),
		),
		ElementWithText("ProfitsBeforeOtherDeductions", fmt.Sprintf("%.2f", ire.TradingProfits)),
		ElementWithNesting("ChargesAndReliefs", ElementWithText("ProfitsBeforeDonationsAndGroupRelief", fmt.Sprintf("%.2f", ire.TradingProfits))),
		ElementWithText("ChargeableProfits", fmt.Sprintf("%.2f", ire.TradingProfits)),
		ElementWithText("CorporationTax", fmt.Sprintf("%.2f", ire.CorporationTax)),
		ElementWithText("NetCorporationTaxChargeable", fmt.Sprintf("%.2f", ire.CorporationTax)),
	}
}

func (ire *IRenvelope) cotoo() []etree.Token {
	return []etree.Token{
		ElementWithText("NetCorporationTaxLiability", fmt.Sprintf("%.2f", ire.CorporationTax)),
		ElementWithText("TaxChargeable", fmt.Sprintf("%.2f", ire.CorporationTax)),
		ElementWithText("TaxPayable", fmt.Sprintf("%.2f", ire.CorporationTax)),
	}
}

func decl() []etree.Token {
	return []etree.Token{
		ElementWithText("AcceptDeclaration", "yes"),
		ElementWithText("Name", "Test"),
		ElementWithText("Status", "Test"),
	}
}

func (ire *IRenvelope) figureAttachments() *etree.Element {
	ret := []etree.Token{}
	if ire.ComputationIXBRL != "" {
		cxml := ElementWithNesting("Computation", ElementWithNesting("Instance", ElementWithNesting("InlineXBRLDocument", ContentFromFile(ire.ComputationIXBRL))))
		ret = append(ret, cxml)
	}
	if ire.AccountsIXBRL != "" {
		acxml := ElementWithNesting("Accounts", ElementWithNesting("Instance", ElementWithNesting("InlineXBRLDocument", ContentFromFile(ire.AccountsIXBRL))))
		ret = append(ret, acxml)
	}
	return ElementWithNesting("XBRLsubmission", ret...)
}
