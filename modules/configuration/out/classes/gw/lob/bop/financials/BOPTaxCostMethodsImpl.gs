package gw.lob.bop.financials

@Export
class BOPTaxCostMethodsImpl extends GenericBOPCostMethodsImpl<BOPTaxCost>
{
  construct( owner : BOPTaxCost)
  {
    super( owner )
  }

  override property get State() : Jurisdiction
  {
    return Cost.TaxState
  }

}
