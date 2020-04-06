package gw.lob.im.financials
uses gw.api.domain.financials.TransactionAdapter

@Export
class IMTransactionAdapter implements TransactionAdapter
{
  var _owner : IMTransaction
  
  construct( owner : IMTransaction )
  {
    _owner = owner
  }
  
  override property get Cost() : Cost
  {
    return _owner.IMCost
  }

}
