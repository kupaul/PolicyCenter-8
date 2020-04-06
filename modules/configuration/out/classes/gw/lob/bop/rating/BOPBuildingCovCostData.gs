package gw.lob.bop.rating
uses java.util.Date
uses gw.api.effdate.EffDatedUtil
uses entity.windowed.BOPBuildingCovVersionList
uses gw.financials.PolicyPeriodFXRateCache

@Export
class BOPBuildingCovCostData extends BOPCostData<BOPBuildingCovCost> {
  
  protected var _covID : Key
  
  construct(effDate : Date, expDate : Date, stateArg : Jurisdiction, covID : Key) {
    super(effDate, expDate, stateArg)
    assertKeyType(covID, entity.BOPBuildingCov)
    init(covID)
  }

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, stateArg : Jurisdiction, covID : Key) {
    super(effDate, expDate, c, rateCache, stateArg)
    assertKeyType(covID, entity.BOPBuildingCov)
    init(covID)
  }

  construct(cost : BOPBuildingCovCost) {
    super(cost)
    init(cost.BOPBuildingCov.FixedId)
  }

  construct(cost : BOPBuildingCovCost, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
    init(cost.BOPBuildingCov.FixedId)
  }

  private function init(covID : Key) {
    _covID = covID
  }

  override function setSpecificFieldsOnCost(line : BOPLine, cost : BOPBuildingCovCost) : void {
    super.setSpecificFieldsOnCost( line, cost )
    cost.setFieldValue("BOPBuildingCov", _covID)
  }

  override function getVersionedCosts(line : BOPLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList( line.Branch, _covID ) as BOPBuildingCovVersionList
    var costs = covVL.Costs.allVersions<BOPBuildingCovCost>(true) // warm up the bundle and global cache
    return costs.Keys.toList()
  }
  
  protected override property get KeyValues() : List<Object> {
    return {_covID}
  }
  
}
