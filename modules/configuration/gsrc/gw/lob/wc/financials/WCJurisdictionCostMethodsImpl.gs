package gw.lob.wc.financials

@Export
class WCJurisdictionCostMethodsImpl extends GenericWCCostMethodsImpl<WCJurisdictionCost>
{
  construct( owner : WCJurisdictionCost )
  {
    super( owner )
  }

  override property get JurisdictionState() : Jurisdiction
  {
    return Cost.WCJurisdiction.State
  }

  override property get OwningCoverable() : Coverable
  {
    return Cost.WCJurisdiction
  }

  override property get ClassCode() : String
  {
    return Cost.StatCode
  }

  override property get Description() : String
  {
    return Cost.WCJurisdictionCostType.DisplayName
  }

}
