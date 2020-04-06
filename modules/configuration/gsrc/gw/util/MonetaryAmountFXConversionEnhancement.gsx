package gw.util

uses gw.api.util.MonetaryAmounts
uses gw.api.util.FXRateUtil
uses gw.currency.fxrate.FXRate
uses gw.pl.currency.MonetaryAmount
uses gw.plugin.Plugins

/**
 * Provide automatic currency conversion using the appropriate plugin
 */
enhancement MonetaryAmountFXConversionEnhancement : MonetaryAmount {

  /*
  * Convert the MonetaryAmount to the given Currency irrespective of time
  */
  function convertAmount(toCurrency : Currency) : MonetaryAmount {
    return FXRateUtil.convertAmount(this, toCurrency)
  }

  /*
  * Convert the MonetaryAmount to the given Currency using the given FXRateMarket irrespective of time
  */
  function convertAmount(toCurrency : Currency, market : FXRateMarket) : MonetaryAmount {
    return FXRateUtil.convertAmount(this, toCurrency, market)
  }

  /*
  * Convert the MonetaryAmount to the given Currency irrespective of time and provide a scaled result
  */
  function convertAndScale(toCurrency : Currency) : MonetaryAmount {
    return MonetaryAmounts.roundToCurrencyScaleNullSafe(FXRateUtil.convertAmount(this, toCurrency))
  }

  /*
  * Convert the MonetaryAmount using the provided FXRate
  * @param rate must have matching Currency to this MonetaryAmount or IllegalArgument will be thrown
  * @return a new MonetaryAmount with the to Currency as provided by FXRate
  */
  function convertAmount(rate : FXRate) : MonetaryAmount {
    if (rate == null) { //coverage and settlement currency match
      return this
    }

    return FXRateUtil.convertAmount(this, rate)
  }

  /*
  * Convert the MonetaryAmount using the provided FXRate and scale the result
  * @param rate must have matching Currency to this MonetaryAmount to be valid
  * @return a new MonetaryAmount with the to Currency as provided by FXRate
  */
  function convertAndScale(rate : FXRate) : MonetaryAmount {
    return this.convertAmount(rate).rescale()
  }

  /**
   * Rescale values to those appropriate for for the given currency
  */
  function rescale() : MonetaryAmount {
    return MonetaryAmounts.roundToCurrencyScaleNullSafe(this)
  }
}
