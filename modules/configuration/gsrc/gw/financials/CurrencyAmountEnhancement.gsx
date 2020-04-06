package gw.financials

uses java.math.BigDecimal

enhancement CurrencyAmountEnhancement : gw.api.financials.CurrencyAmount {

  property get IsZero() : boolean {
    return this.Amount == 0
  }

  property get IsNotZero() : boolean {
    return this.Amount != 0
  }

  property get IsNegative() : boolean {
    return this.Amount.compareTo(BigDecimal.ZERO) < 0
  }  

  property get IsPositive() : boolean {
    return this.Amount.compareTo(BigDecimal.ZERO) > 0
  }
}