package gw.lob.im.financials

@Export
class GenericIMCostMethodsImpl<T extends IMCost> implements IMCostMethods {
  
  protected var _owner : T as readonly Cost
  
  construct( owner : T ) {
    _owner = owner
  }

  override property get Coverage() : Coverage {
    return null 
  }

  override property get OwningCoverable() : Coverable
  {
    return null
  }

  override property get State() : Jurisdiction{
    return null 
  }

  override property get Location() : PolicyLocation {
    return null 
  }
}

