package gw.lob.pa.financials
uses gw.api.domain.financials.TransactionAdapter

@Export
class PATransactionAdapter implements TransactionAdapter
{
  var _owner : PATransaction
  
  construct( owner : PATransaction )
  {
    _owner = owner
  }
  
  override property get Cost() : Cost
  {
    return _owner.PACost
  }

}
