package gw.reinsurance.risk

uses gw.pl.currency.MonetaryAmount
uses gw.api.util.DateUtil
uses gw.plugin.Plugins
uses gw.plugin.reinsurance.IReinsuranceConfigPlugin

@Export
class RIRiskCedeableAdapter extends AbstractCedeableAdapter {
  var _ririsk : RIRisk

  construct(owner : RIRisk) {
    super()
    _ririsk = owner
  }

  private property get ririsk() : RIRisk {
    return _ririsk
  }

  override property get TotalRisk() : MonetaryAmount {
    return ririsk.TotalRisk
  }

  override property get GrossRetention() : MonetaryAmount {
    return ririsk.GrossRetention
  }

  override function getOverrideCededAmountForSurplusRITreaty(agreement : SurplusRITreaty) : MonetaryAmount {
    var configPlugin = Plugins.get(IReinsuranceConfigPlugin)
    return configPlugin.getOverrideCededAmountForSurplusRITreaty(ririsk, agreement)
  }
  
  override property get Currency() : Currency {
    return _ririsk.Currency
  }

  override property get PercentageScale() : int {
    return ririsk.PercentageScale
  }

  override property get Reinsurable() : Reinsurable {
    var riskNumber = ririsk.VersionList.RiskNumber
    if(riskNumber == null) {
      throw "This RIRisk ${ririsk} has null RiskNumber."
    }
    //use last second of the day because policy period startDate time can be changed
    var effectiveDate = DateUtil.endOfDay(ririsk.EffectiveDate)
    var branch = ririsk.VersionList.PolicyPeriod.getSlice(effectiveDate)
    return branch.AllReinsurables.singleWhere(\ r -> r.RiskNumber == riskNumber )
      .VersionList.getVersionAsOf(effectiveDate) as Reinsurable
  }
}