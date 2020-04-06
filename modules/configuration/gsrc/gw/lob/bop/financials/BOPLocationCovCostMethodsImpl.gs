package gw.lob.bop.financials
uses gw.api.util.JurisdictionMappingUtil

@Export
class BOPLocationCovCostMethodsImpl extends GenericBOPCostMethodsImpl<BOPLocationCovCost>
{
  construct( owner : BOPLocationCovCost )
  {
    super( owner )
  }

  override property get Coverage() : Coverage
  {
    return Cost.BOPLocationCov
  }

  override property get OwningCoverable() : Coverable
  {
    return Cost.BOPLocationCov.BOPLocation
  }
  
  override property get State() : Jurisdiction
  {
    return JurisdictionMappingUtil.getJurisdiction(Cost.BOPLocationCov.BOPLocation.Location)
  }

  override property get Location() : BOPLocation
  {
    return Cost.BOPLocationCov.BOPLocation
  }

}
