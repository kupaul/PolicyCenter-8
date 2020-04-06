package gw.lob.pa

uses gw.policy.PolicyLineConfiguration
uses gw.lob.pa.rating.PARateRoutineConfig
uses gw.plugin.rateflow.IRateRoutineConfig
uses gw.api.productmodel.PolicyLinePattern
uses java.util.Collection
uses gw.api.productmodel.PolicyLinePatternLookup

@Export
class PAConfiguration extends PolicyLineConfiguration {
  override property get RateRoutineConfig(): IRateRoutineConfig {
    return new PARateRoutineConfig()
  }

  override property get AllowedCurrencies(): List<Currency> {
    var pattern = PolicyLinePatternLookup.getByCode(InstalledPolicyLine.TC_PA.UnlocalizedName)
    return pattern.AvailableCurrenciesByPriority
  }
}