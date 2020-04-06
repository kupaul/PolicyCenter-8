package gw.lob.bop.financials

@Export
class BOPAddnlInsuredCostMethodsImpl extends GenericBOPCostMethodsImpl<BOPAddnlInsuredCost>
{
  construct( owner : BOPAddnlInsuredCost )
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
