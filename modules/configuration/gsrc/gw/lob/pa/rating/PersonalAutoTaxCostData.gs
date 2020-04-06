package gw.lob.pa.rating
uses java.util.Date
uses gw.financials.PolicyPeriodFXRateCache

@Export
class PersonalAutoTaxCostData extends PACostData<PersonalAutoTaxCost> {

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache) {
    super(effDate, expDate, c, rateCache)
    init()
  }

  construct(effDate : Date, expDate : Date) {
    super(effDate, expDate)
    init()
  }

  private function init() {
    RateAmountType = "TaxSurcharge"
    // This looks odd, but because the getter for ChargePattern contains logic, what it is actually doing
    // is running that logic in the getter, and then persisting the value.
    ChargePattern = this.ChargePattern
  }

  override function getVersionedCosts(line : PersonalAutoLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    return line.VersionList.PACosts.where( \ costVL ->
           {
             var firstCost = costVL.AllVersions.first()
             if (firstCost typeis PersonalAutoTaxCost and firstCost.ChargePattern == this.ChargePattern)
               return true
             else
               return false
           }
         ).toList()
  }

  override function setSpecificFieldsOnCost(line : PersonalAutoLine,cost : PersonalAutoTaxCost) : void {
    cost.PersonalAutoLine = line
    cost.ChargePattern = this.ChargePattern
  }

  protected override property get KeyValues() : List<Object> {
    return {}
  }

}
