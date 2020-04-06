package gw.lob.cp.rating
uses gw.rating.CostDataWithOverrideSupport
uses gw.financials.PolicyPeriodFXRateCache

@Export
abstract class CPCostData<T extends CPCost> extends CostDataWithOverrideSupport<T, CommercialPropertyLine> {
  construct(effDate : DateTime, expDate : DateTime) {
    super(effDate, expDate)
  }

  construct(effDate : DateTime, expDate : DateTime, c : Currency, rateCache : PolicyPeriodFXRateCache) {
    super(effDate, expDate, c, rateCache)
  }

  construct(cost : T) {
    super(cost)
  }

  construct(cost : T, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
  }

  override function setSpecificFieldsOnCost(line : CommercialPropertyLine, cost : T) {
    cost.setFieldValue("CommercialPropertyLine", line.FixedId)
  }
}
