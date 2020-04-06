package gw.lob.bop.financials
uses gw.api.util.JurisdictionMappingUtil

@Export
class BOPBuildingCovCostMethodsImpl extends GenericBOPCostMethodsImpl<BOPBuildingCovCost>
{
  construct( owner : BOPBuildingCovCost )
  {
    super( owner )
  }
  
  override property get Coverage() : Coverage
  {
    return Cost.BOPBuildingCov
  }

  override property get OwningCoverable() : Coverable
  {
    return Cost.BOPBuildingCov.BOPBuilding
  }
  
  override property get State() : Jurisdiction
  {
    return JurisdictionMappingUtil.getJurisdiction(Cost.BOPBuildingCov.BOPBuilding.BOPLocation.Location)
  }

  override property get Location() : BOPLocation
  {
    return Cost.BOPBuildingCov.BOPBuilding.BOPLocation
  }

  override property get Building() : BOPBuilding
  {
    return Cost.BOPBuildingCov.BOPBuilding
  }

}
