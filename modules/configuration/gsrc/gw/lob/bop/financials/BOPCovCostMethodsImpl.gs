package gw.lob.bop.financials

@Export
class BOPCovCostMethodsImpl extends GenericBOPCostMethodsImpl<BOPCovCost>
{
  construct( owner : BOPCovCost)
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
    return Cost.BusinessOwnersLine.BaseState
  }

}
