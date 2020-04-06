package gw.lob.bop.financials

@Export
class GenericBOPCostMethodsImpl<T extends BOPCost> implements BOPCostMethods
{
  protected var _owner : T as readonly Cost
  
  construct( owner : T )
  {
    _owner = owner
  }

  override property get Coverage() : Coverage
  {
    return null
  }

  override property get OwningCoverable() : Coverable
  {
    return null
  }

  override property get State() : Jurisdiction  {
    return null
  }

  override property get Location() : BOPLocation
  {
    return null
  }

  override property get Building() : BOPBuilding
  {
    return null
  }

}
