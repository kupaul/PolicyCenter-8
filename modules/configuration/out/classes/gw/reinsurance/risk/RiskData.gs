package gw.reinsurance.risk

uses gw.api.reinsurance.ReinsurableCoverable
uses gw.pl.currency.MonetaryAmount
uses gw.api.util.MonetaryAmounts

@Export
class RiskData {
  private var _covGroup : RICoverageGroupType as CoverageGroup
  private var _owner : ReinsurableCoverable as Owner
  private var _tiv : MonetaryAmount
  private var _currency : Currency as ReinsuranceCurrency

  construct(o : ReinsurableCoverable, covGroup : RICoverageGroupType, tiv : MonetaryAmount, currency : Currency) {
    CoverageGroup = covGroup
    Owner = o
    TotalInsuredValue = MonetaryAmounts.roundToCurrencyScaleNullSafe(tiv)
    ReinsuranceCurrency = currency
  }

  property get TotalInsuredValue() : MonetaryAmount {
    return _tiv
  }

  property set TotalInsuredValue(value : MonetaryAmount) {
    _tiv = MonetaryAmounts.roundToCurrencyScaleNullSafe(value)
  }

  function getOrCreateReinsurable(branch : PolicyPeriod) : Reinsurable {
    var riskEntity = branch.AllReinsurables.firstWhere(\ r -> r.CoverageGroup == CoverageGroup
      and Owner.isTheSame(r.Coverable))
    if(riskEntity == null){
      riskEntity = Owner.createReinsurableRisk()
      riskEntity.CoverageGroup = CoverageGroup
    }
    riskEntity.TotalInsuredValue = TotalInsuredValue
    riskEntity.ReinsuranceCurrency = ReinsuranceCurrency
    return riskEntity
  }
}