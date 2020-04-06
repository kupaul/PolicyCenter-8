package gw.lob.bop.financials

@Export
class BOPMinPremiumCostMethodsImpl extends GenericBOPCostMethodsImpl<BOPMinPremiumCost>
{
  construct( owner : BOPMinPremiumCost )
  {
    super( owner )
  }

  override property get OwningCoverable() : Coverable
  {
    return Cost.BusinessOwnersLine
  }
  
  override property get State() : Jurisdiction
  {
    return Cost.BusinessOwnersLine.BaseState
  }

}
