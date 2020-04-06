package gw.webservice.pc.pc700.ccintegration.ccentities

uses gw.pl.currency.MonetaryAmount
uses java.math.BigDecimal
uses gw.api.financials.CurrencyAmount

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCFinancialCovTerm extends CCCovTerm {
  /** **/
  var _amount: CurrencyAmount as FinancialAmount
  construct() {
  }

  function setFinancialAmount(value: MonetaryAmount) {
    if (value == null) {
      _amount = null
    } else {
      _amount = new CurrencyAmount(value.Amount, value.Currency)
    }
  }

  function setFinancialAmount(value: BigDecimal, currency: Currency) {
    if (value == null || currency == null) {
      setFinancialAmount(null)
    } else {
      setFinancialAmount(new MonetaryAmount(value, currency))
    }
  }
}
