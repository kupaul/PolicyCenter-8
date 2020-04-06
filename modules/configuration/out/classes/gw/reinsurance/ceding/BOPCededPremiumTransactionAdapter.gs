package gw.reinsurance.ceding
uses gw.api.reinsurance.RICededPremiumTxnAdapter

@Export
class BOPCededPremiumTransactionAdapter implements RICededPremiumTxnAdapter {

  protected var _owner : BOPCededPremiumTransaction
  construct(owner : BOPCededPremiumTransaction) {
    _owner = owner
  }

  override property get RICededPremium() : RICededPremium {
    return _owner.BOPCededPremium
  }

  override property get RICededPremiumHistory() : RICededPremiumHistory {
    return _owner.BOPCededPremiumHistory
  }
}
