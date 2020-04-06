package gw.lob.gl.financials
uses gw.api.domain.financials.TransactionAdapter

@Export
class GLTransactionAdapter implements TransactionAdapter
{
  var _owner : GLTransaction
  
  construct( owner : GLTransaction )
  {
    _owner = owner
  }
  
  override property get Cost() : Cost
  {
    return _owner.GLCost
  }

}
