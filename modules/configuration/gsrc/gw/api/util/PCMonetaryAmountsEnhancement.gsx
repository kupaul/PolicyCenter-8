package gw.api.util

uses gw.pl.currency.MonetaryAmount

uses java.math.BigDecimal
uses java.math.RoundingMode

enhancement PCMonetaryAmountsEnhancement : MonetaryAmounts {

  static function roundToCurrencyScale(amount : MonetaryAmount) : MonetaryAmount {
    return MonetaryAmounts.roundToCurrencyScale(amount, CurrencyUtil.getRoundingMode())
  }

  static function roundToCurrencyScaleNullSafe(amount : MonetaryAmount) : MonetaryAmount {
    return roundToCurrencyScaleNullSafe(amount, CurrencyUtil.getRoundingMode())
  }

  static function roundToCurrencyScaleNullSafe(amount : MonetaryAmount, mode : RoundingMode) : MonetaryAmount {
    if (amount == null) {
      return null
    }
    return MonetaryAmounts.roundToCurrencyScale(amount, mode)
  }
}
