package gw.lob.cp.financials

@Export
class GenericCPCostMethodsImpl<T extends CPCost> implements CPCostMethods
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

  override property get Location() : CPLocation
  {
    return null
  }

  override property get Building() : CPBuilding
  {
    return null
  }

}
