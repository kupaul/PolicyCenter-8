package gw.lob.ba.financials

@Export
class GenericBACostMethodsImpl<T extends BACost> implements BACostMethods
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

  override property get State() : Jurisdiction
  {
    return null
  }

  override property get Vehicle() : BusinessVehicle
  {
    return null
  }

}
