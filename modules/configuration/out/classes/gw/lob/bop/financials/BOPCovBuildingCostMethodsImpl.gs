package gw.lob.bop.financials
uses gw.api.util.JurisdictionMappingUtil

@Export
class BOPCovBuildingCostMethodsImpl extends GenericBOPCostMethodsImpl<BOPCovBuildingCost>
{
  construct( owner : BOPCovBuildingCost )
  {
    super( owner )
  }

  override property get Coverage() : Coverage
  {
    return Cost.BusinessOwnersCov
  }

  override property get OwningCoverable() : Coverable
  {
    return Cost.BusinessOwnersLine
  }
  
  override property get State() : Jurisdiction
  {
    return JurisdictionMappingUtil.getJurisdiction(Cost.BOPBuilding.BOPLocation.Location)
  }

  override property get Location() : BOPLocation
  {
    return Cost.BOPBuilding.BOPLocation
  }

  override property get Building() : BOPBuilding
  {
    return Cost.BOPBuilding
  }

}
