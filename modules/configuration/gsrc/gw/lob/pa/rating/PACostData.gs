package gw.lob.pa.rating
uses java.util.Date
uses gw.rating.CostData
uses gw.financials.PolicyPeriodFXRateCache

@Export
abstract class PACostData<R extends PACost> extends CostData<R, PersonalAutoLine> {
  
  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache) {
    super(effDate, expDate, c, rateCache)
  }

  construct(effDate : Date, expDate : Date) {
    super(effDate, expDate)
  }

  construct(c : R) {
    super(c)
  }

  construct(c : R, rateCache : PolicyPeriodFXRateCache) {
    super(c, rateCache)
  }

  override function setSpecificFieldsOnCost(line : PersonalAutoLine, cost : R) {
    cost.setFieldValue("PersonalAutoLine", line.FixedId)
  }

}
