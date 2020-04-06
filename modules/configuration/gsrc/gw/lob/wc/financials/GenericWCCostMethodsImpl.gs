package gw.lob.wc.financials
uses java.lang.Integer

@Export
class GenericWCCostMethodsImpl<T extends WCCost> implements WCCostMethods
{
  protected var _owner : T as readonly Cost

  construct( owner : T )
  {
    _owner = owner
  }

  override property get JurisdictionState() : Jurisdiction
  {
    return null
  }

  override property get OwningCoverable() : Coverable
  {
    return null
  }

  override property get LocationNum() : Integer
  {
    return null
  }

  override property get ClassCode() : String
  {
    return null
  }

  override property get Description() : String
  {
    return null
  }

}
