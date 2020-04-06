package gw.lob.ba.financials

@Export
class BALineCovNonownedCostMethodsImpl extends GenericBACostMethodsImpl<BALineCovNonownedCost> {

  construct( owner : BALineCovNonownedCost ) {
    super( owner )
  }
  
  override property get Coverage() : Coverage
  {
    return Cost.BusinessAutoCov
  }
  
  override property get OwningCoverable() : Coverable
  {
    return Cost.BusinessAutoLine
  }

  override property get State() : Jurisdiction
  {
    return Cost.Jurisdiction.State
  }
}
