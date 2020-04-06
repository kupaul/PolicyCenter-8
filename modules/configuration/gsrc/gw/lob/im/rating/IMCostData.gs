package gw.lob.im.rating
uses gw.rating.CostData
uses gw.financials.PolicyPeriodFXRateCache

@Export
abstract class IMCostData<T extends IMCost> extends CostData<T, InlandMarineLine> {
  
  construct(effDate : DateTime, expDate : DateTime) {
    super(effDate, expDate)
  }
  
  construct(effDate : DateTime, expDate : DateTime, c : Currency, rateCache : PolicyPeriodFXRateCache) {
    super(effDate, expDate, c, rateCache)
  }
  
  override function setSpecificFieldsOnCost(line : InlandMarineLine, cost : T) {
    cost.setFieldValue("InlandMarineLine", line.FixedId)
  }
}
