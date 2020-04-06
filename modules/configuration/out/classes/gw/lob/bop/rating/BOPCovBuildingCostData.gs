package gw.lob.bop.rating
uses java.util.Date
uses gw.api.effdate.EffDatedUtil
uses entity.windowed.BOPBuildingVersionList
uses gw.financials.PolicyPeriodFXRateCache

@Export
class BOPCovBuildingCostData extends BOPCostData<BOPCovBuildingCost>  {
  
  var _covID : Key
  var _buildingID : Key
  
  construct(effDate : Date, expDate : Date, stateArg : Jurisdiction, covID : Key, buildingID : Key) {
    super(effDate, expDate, stateArg)
    assertKeyType(covID, BusinessOwnersCov)
    assertKeyType(buildingID, BOPBuilding)
    init(covID, buildingID)
  }

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, stateArg : Jurisdiction, covID : Key, buildingID : Key) {
    super(effDate, expDate, c, rateCache, stateArg)
    assertKeyType(covID, BusinessOwnersCov)
    assertKeyType(buildingID, BOPBuilding)
    init(covID, buildingID)
  }

  construct(cost : BOPCovBuildingCost) {
    super(cost)
    init(cost.BusinessOwnersCov.FixedId, cost.BOPBuilding.FixedId)
  }

  construct(cost : BOPCovBuildingCost, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
    init(cost.BusinessOwnersCov.FixedId, cost.BOPBuilding.FixedId)
  }

  private function init(covID : Key, buildingID : Key) {
    _covID = covID
    _buildingID = buildingID
  }
  
  override function setSpecificFieldsOnCost(line : BOPLine, cost : BOPCovBuildingCost) {
    super.setSpecificFieldsOnCost( line, cost )
    cost.setFieldValue("BusinessOwnersCov", _covID)
    cost.setFieldValue("BOPBuilding", _buildingID)
  }

  override function getVersionedCosts(line : BOPLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList( line.Branch, _buildingID ) as BOPBuildingVersionList
    var costs = covVL.Costs.allVersions<BOPCovBuildingCost>(true) // warm up the bundle and global cache
    return costs.Keys.where(\ VL -> costs[VL].first().Building.FixedId == _buildingID)
  }
    
  protected override property get KeyValues() : List<Object> {
    return {_buildingID, _covID}
  }
}
