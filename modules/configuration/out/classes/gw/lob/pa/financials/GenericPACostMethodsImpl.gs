package gw.lob.pa.financials

@Export
class GenericPACostMethodsImpl<T extends PACost> implements PACostMethods
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

  override property get Vehicle() : PersonalVehicle
  {
    return null
  }

}
