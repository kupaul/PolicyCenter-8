package gw.financials.transactions
uses gw.currency.fxrate.FXRate

enhancement PolicyFXRateEnhancement : entity.PolicyFXRate {
  
  static function valueOf(period : PolicyPeriod, rate : FXRate) : PolicyFXRate {
    var policyRate = new PolicyFXRate(period.Bundle)
    policyRate.PolicyPeriod = period
    policyRate.Market = rate.Market
    policyRate.FromCurrency = rate.FromCurrency
    policyRate.ToCurrency = rate.ToCurrency
    policyRate.MarketTime = rate.MarketTime
    policyRate.Rate = rate.Rate
    policyRate.RetrievedAt = rate.RetrievedAt
    period.addToPolicyFXRates(policyRate)
    return policyRate
  }
  
}
