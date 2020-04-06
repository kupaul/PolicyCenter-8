package gw.lob.wc.financials
uses gw.api.domain.financials.TransactionAdapter

@Export
class WCTransactionAdapter implements TransactionAdapter
{
  var _owner : WCTransaction
  
  construct( owner : WCTransaction )
  {
    _owner = owner
  }
  
  override property get Cost() : Cost
  {
    return _owner.WCCost
  }

}
