package gw.lob.ba.financials

@Export
class BAStateCovCostMethodsImpl extends GenericBACostMethodsImpl<BAStateCovCost>
{
  
  construct( owner : BAStateCovCost )
  {
    super( owner )
  }

  override property get Coverage() : Coverage
  {
    return Cost.BAStateCov
  }
  
  override property get OwningCoverable() : Coverable
  {
    return Cost.Jurisdiction
  }

  override property get State() : Jurisdiction
  {
    return Cost.Jurisdiction.State
  }
}
