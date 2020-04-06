package gw.lob.gl.financials

@Export
class GenericGLCostMethodsImpl<T extends GLCost> implements GLCostMethods {
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

  override property get State() : Jurisdiction {
    return null
  }

  override property get Location() : PolicyLocation {
    return null
  }

  override property get DisplayOrder() : int {
    return -1
  }
}
