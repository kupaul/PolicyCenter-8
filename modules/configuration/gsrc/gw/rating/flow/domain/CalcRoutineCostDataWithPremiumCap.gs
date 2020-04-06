package gw.rating.flow.domain
uses gw.rating.CostData
uses java.lang.Integer
uses java.math.RoundingMode
uses java.math.BigDecimal
uses java.lang.IllegalStateException

@Export
class CalcRoutineCostDataWithPremiumCap extends CalcRoutineCostData {

  construct(costData : CostData, defaultRoundingLevel : Integer, defaultRoundingMode : RoundingMode) {
    super(costData, defaultRoundingLevel, defaultRoundingMode)
  }
  
  property get CappedTermAmount() : BigDecimal {
    return _costData.OverrideTermAmount
  }
  
  property set CappedTermAmount(amount : BigDecimal) {
    if (not _costData.Overridable) {
      throw new IllegalStateException("cannot do premium capping if CostData is not Overridable")
    }
    _costData.OverrideTermAmount = amount
    _costData.OverrideReason = displaykey.Rating.OverrideReason.AutomaticRenewalCap
    _costData.OverrideSource = OverrideSourceType.TC_RENEWALCAP
  }
}
