package gw.lob.cp.financials
uses gw.api.util.JurisdictionMappingUtil

@Export
class CPBuildingCovCostMethodsImpl extends GenericCPCostMethodsImpl<CPBuildingCovCost>
{
  construct( owner : CPBuildingCovCost )
  {
    super( owner )
  }
  
  override property get Coverage() : Coverage
  {
    return Cost.CPBuildingCov
  }

  override property get OwningCoverable() : Coverable
  {
    return Cost.Building
  }

  override property get State() : Jurisdiction
  {
    return JurisdictionMappingUtil.getJurisdiction(Cost.CPBuildingCov.CPBuilding.CPLocation.Location)
  }

  override property get Location() : CPLocation
  {
    return Cost.CPBuildingCov.CPBuilding.CPLocation
  }

  override property get Building() : CPBuilding
  {
    return Cost.CPBuildingCov.CPBuilding
  }

}
