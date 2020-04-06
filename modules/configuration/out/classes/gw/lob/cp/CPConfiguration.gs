package gw.lob.cp

uses gw.plugin.rateflow.IRateRoutineConfig
uses gw.policy.PolicyLineConfiguration
uses gw.lob.cp.rating.CPRateRoutineConfig
uses gw.api.productmodel.PolicyLinePatternLookup

@Export
class CPConfiguration extends PolicyLineConfiguration {

  override property get RateRoutineConfig(): IRateRoutineConfig {
    return new CPRateRoutineConfig()
  }

  override property get AllowedCurrencies(): List<Currency> {
    var pattern = PolicyLinePatternLookup.getByCode(InstalledPolicyLine.TC_CP.UnlocalizedName)
    return pattern.AvailableCurrenciesByPriority
  }
}