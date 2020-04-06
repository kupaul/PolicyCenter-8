package gw.lob.ba.financials
uses gw.api.domain.financials.TransactionAdapter

@Export
class BATransactionAdapter implements TransactionAdapter
{
  var _owner : BATransaction
  
  construct( owner : BATransaction )
  {
    _owner = owner
  }
  
  override property get Cost() : Cost
  {
    return _owner.BACost
  }

}
