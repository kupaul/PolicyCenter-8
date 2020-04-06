package gw.lob.cp.financials
uses gw.api.domain.financials.TransactionAdapter

@Export
class CPTransactionAdapter implements TransactionAdapter
{
  var _owner : CPTransaction
  
  construct( owner : CPTransaction )
  {
    _owner = owner
  }
  
  override property get Cost() : Cost
  {
    return _owner.CPCost
  }

}
