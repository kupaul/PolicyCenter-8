package gw.api.util

uses gw.api.financials.CurrencyAmount
uses gw.currency.fxrate.FXRate
uses gw.pl.currency.MonetaryAmount

enhancement FXRateUtilEnhancement : FXRateUtil {

  @java.lang.Deprecated
  static function convertAndScale(amount : CurrencyAmount, rate : FXRate) : CurrencyAmount {
    if (amount == null) {
      return null
    } else if (rate == null) { //coverage and settlement currency match
      return amount
    }
    var monetaryAmt = new MonetaryAmount(amount.Amount, amount.Currency)
    return convertAndScale(monetaryAmt, rate)
  }

  static function convertAndScale(amount : MonetaryAmount, rate : FXRate) : MonetaryAmount {
    if (amount == null) {
      return null
    } else if (rate == null) { //coverage and settlement currency match
      return amount
    }
    return MonetaryAmounts.roundToCurrencyScale(FXRateUtil.convertAmount(amount, rate))
  }
}