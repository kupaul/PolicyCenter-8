package gw.lob.bop

uses gw.plugin.rateflow.IRateRoutineConfig
uses gw.policy.PolicyLineConfiguration
uses gw.api.productmodel.PolicyLinePatternLookup

@Export
class BOPConfiguration extends PolicyLineConfiguration {

  override property get RateRoutineConfig(): IRateRoutineConfig {
    return null
  }

  override property get AllowedCurrencies(): List<Currency> {
    var pattern = PolicyLinePatternLookup.getByCode(InstalledPolicyLine.TC_BOP.UnlocalizedName)
    return pattern.AvailableCurrenciesByPriority
  }
}