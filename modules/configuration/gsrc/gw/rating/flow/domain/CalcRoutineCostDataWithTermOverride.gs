package gw.rating.flow.domain
uses gw.rating.CostDataWithOverrideSupport
uses java.lang.Integer
uses java.math.RoundingMode
uses java.math.BigDecimal
uses java.lang.IllegalStateException
uses gw.api.rating.flow.VisibleInRateflow

@Export
class CalcRoutineCostDataWithTermOverride extends CalcRoutineCostDataWithAmountOverride {

  construct(costData : CostDataWithOverrideSupport, mode : OverrideMode, defaultRoundingLevel : Integer, defaultRoundingMode : RoundingMode) {
    super(costData, mode, defaultRoundingLevel, defaultRoundingMode)
  }

  // Should only expose amount if Cost being rated is Basis Scalable; otherwise use this
  // class, which does not allow the rate routine to get or set Amount.

  @VisibleInRateflow(false)
  override property get Amount() : BigDecimal {
    throw new IllegalStateException("Should be inaccessible")
  }
  
  @VisibleInRateflow(false)
  override property set Amount(amt : BigDecimal) {
    throw new IllegalStateException("Should be inaccessible")
  }

}
