package gw.lob.bop.financials
uses gw.api.domain.financials.TransactionAdapter

@Export
class BOPTransactionAdapter implements TransactionAdapter
{
  var _owner : BOPTransaction
  
  construct( owner : BOPTransaction )
  {
    _owner = owner
  }
  
  override property get Cost() : Cost
  {
    return _owner.BOPCost
  }

}
