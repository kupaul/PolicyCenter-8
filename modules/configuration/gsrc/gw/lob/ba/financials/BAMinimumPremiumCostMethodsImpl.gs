package gw.lob.ba.financials

@Export
class BAMinimumPremiumCostMethodsImpl extends GenericBACostMethodsImpl<BAMinimumPremiumCost>
{
  
  construct( owner : BAMinimumPremiumCost )
  {
    super( owner )
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
