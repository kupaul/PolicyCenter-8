package gw.lob.bop.rating
uses java.util.Date
uses gw.api.effdate.EffDatedUtil
uses entity.windowed.BOPLocationCovVersionList
uses gw.financials.PolicyPeriodFXRateCache

@Export
class BOPLocationCovCostData extends BOPCostData<BOPLocationCovCost> {
  
  protected var _covID : Key
  
  construct(effDate : Date, expDate : Date, stateArg : Jurisdiction, covID : Key) {
    super(effDate, expDate, stateArg)
    assertKeyType(covID, BOPLocationCov)
    init(covID)
  }

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, stateArg : Jurisdiction, covID : Key) {
    super(effDate, expDate, c, rateCache, stateArg)
    assertKeyType(covID, BOPLocationCov)
    init(covID)
  }

  construct(cost : BOPLocationCovCost) {
    super(cost)
    init(cost.BOPLocationCov.FixedId)
  }

  construct(cost : BOPLocationCovCost, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
    init(cost.BOPLocationCov.FixedId)
  }

  private function init(covID : Key) {
    _covID = covID
  }

  override function setSpecificFieldsOnCost(line : BOPLine, cost : BOPLocationCovCost) {
    super.setSpecificFieldsOnCost( line, cost )
    cost.setFieldValue("BOPLocationCov", _covID)
  }

  override function getVersionedCosts(line : BOPLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList( line.Branch, _covID ) as BOPLocationCovVersionList
    return covVL.Costs
  }
  
  protected override property get KeyValues() : List<Object> {
    return {_covID}
  }
}
