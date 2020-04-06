package gw.lob.ba.financials

@Export
class BAJurisdictionCostMethodsImpl extends GenericBACostMethodsImpl<BAJurisdictionCost>
{
  construct( owner : BAJurisdictionCost )
  {
    super( owner )
  }
  
  override property get State() : Jurisdiction
  {
    return Cost.Jurisdiction.State
  }
}
