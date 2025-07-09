package govtalk

import (
	"fmt"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
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
}

func (ire *IRenvelope) AsXML() any {
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
	irh := ElementWithNesting("IRheader", keys, pe, dc, manifest)
	irh.Elements = append(irh.Elements, ElementWithText("Sender", ire.Sender))
	ci := ElementWithNesting("CompanyInformation", companyInfo(ire.Business, ire.UTR, ire.PeriodStart, ire.PeriodEnd))
	summary := ElementWithNesting("ReturnInfoSummary", accounts(), computations())
	turnover := ElementWithNesting("Turnover", ElementWithText("Total", fmt.Sprintf("%.2f", ire.Turnover)))
	calc := ElementWithNesting("CompanyTaxCalculation", ire.taxCalc())
	too := ElementWithNesting("CalculationOfTaxOutstandingOrOverpaid", ire.cotoo())
	decl := ElementWithNesting("Declaration", decl())
	ctr := MakeCompanyTaxReturn(ire.ReturnType, ci, summary, turnover, calc, too, decl)
	return MakeIRenvelopeMessage(irh, ctr)
}

func companyInfo(business config.Business, UTR, start, end string) []any {
	return []any{
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

func accounts() any {
	return ElementWithNesting("Accounts", ElementWithText("NoAccountsReason", "Not within charge to CT"))
}

func computations() any {
	return ElementWithNesting("Computations", ElementWithText("NoComputationsReason", "Not within charge to CT"))
}

func (ire *IRenvelope) taxCalc() []any {
	return []any{
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

func (ire *IRenvelope) cotoo() []any {
	return []any{
		ElementWithText("NetCorporationTaxLiability", fmt.Sprintf("%.2f", ire.CorporationTax)),
		ElementWithText("TaxChargeable", fmt.Sprintf("%.2f", ire.CorporationTax)),
		ElementWithText("TaxPayable", fmt.Sprintf("%.2f", ire.CorporationTax)),
	}
}

func decl() []any {
	return []any{
		ElementWithText("AcceptDeclaration", "yes"),
		ElementWithText("Name", "Test"),
		ElementWithText("Status", "Test"),
	}
}
