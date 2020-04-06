package gw.lob.wc.rating
uses java.util.Date
uses gw.rating.CostData
uses gw.financials.PolicyPeriodFXRateCache

@Export
abstract class WCCostData<T extends WCCost> extends CostData<T, WorkersCompLine>  {
  
  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache) {
    super(effDate, expDate, c, rateCache)
  }
  
  construct(effDate : Date, expDate : Date) {
    super(effDate, expDate)
  }
  
  override function setSpecificFieldsOnCost(line : WorkersCompLine, cost : T) {
    cost.setFieldValue("WorkersCompLine", line.FixedId)
  }
}
