package gw.lob.bop.rating
uses java.util.Date
uses gw.financials.PolicyPeriodFXRateCache

@Export
class BOPTaxCostData extends BOPCostData<BOPTaxCost> {
  
  construct(effDate : Date, expDate : Date, taxState : Jurisdiction) {
    super(effDate, expDate, taxState)
    RateAmountType = "TaxSurcharge"
  }

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, taxState : Jurisdiction) {
    super(effDate, expDate, c, rateCache, taxState)
    RateAmountType = "TaxSurcharge"
  }

  override function setSpecificFieldsOnCost(line : BOPLine, cost : BOPTaxCost) : void {
    super.setSpecificFieldsOnCost( line, cost )
    cost.ChargePattern = "Taxes"
    cost.TaxState      = State
  }

  override function getVersionedCosts(line : BOPLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    return line.VersionList.BOPCosts.where( \ vl -> versionListMatches(vl)).toList()
  }
  
  private function versionListMatches(costVL : entity.windowed.BOPCostVersionList) : boolean {
    var first = costVL.AllVersions.first()
    return first typeis BOPTaxCost and first.State == State
  }
  
  protected override property get KeyValues() : List<Object> {
    return {State}
  }
  
}
