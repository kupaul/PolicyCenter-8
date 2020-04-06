package gw.lob.cp.rating
uses entity.windowed.CPBuildingCovVersionList
uses gw.api.effdate.EffDatedUtil
uses gw.financials.PolicyPeriodFXRateCache

@Export
abstract class CPBuildingCovCostData<T extends CPBuildingCovCost> extends CPCostData<T>
{
  private var _covID : Key
  private var _state : Jurisdiction as State
  
  construct(effDate : DateTime, expDate : DateTime, covID : Key, stateArg : Jurisdiction) {
    super(effDate, expDate)
    assertKeyType(covID, CPBuildingCov)
    init(covID, stateArg)
  }

  construct(effDate : DateTime, expDate : DateTime, c : Currency, rateCache : PolicyPeriodFXRateCache, covID : Key, stateArg : Jurisdiction) {
    super(effDate, expDate, c, rateCache)
    assertKeyType(covID, CPBuildingCov)
    init(covID, stateArg)
  }

  construct(cost : T) {
    super(cost)
    init(cost.CPBuildingCov.FixedId, cost.State)
  }

  construct(cost : T, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
    init(cost.CPBuildingCov.FixedId, cost.State)
  }

  private function init(covID : Key, stateArg : Jurisdiction) {
    _covID = covID
    _state = stateArg
  }

  override function setSpecificFieldsOnCost(line : CommercialPropertyLine, cost : T) {
    super.setSpecificFieldsOnCost(line, cost)
    cost.setFieldValue("CPBuildingCov", _covID)
  }

  override function getVersionedCosts(line : CommercialPropertyLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList( line.Branch, _covID ) as CPBuildingCovVersionList
    var costs = covVL.Costs.allVersions<CPBuildingCovCost>(true) // warm up the bundle and global cache
    return costs.Keys.where(\ VL -> costs[VL].first() typeis T)
  }

  protected override property get KeyValues() : List<Object> {
    return {_covID}
  }
 
}
