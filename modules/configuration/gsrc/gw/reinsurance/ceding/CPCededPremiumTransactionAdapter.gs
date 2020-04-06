package gw.reinsurance.ceding
uses gw.api.reinsurance.RICededPremiumTxnAdapter

@Export
class CPCededPremiumTransactionAdapter implements RICededPremiumTxnAdapter {

  protected var _owner : CPCededPremiumTransaction
  construct(owner : CPCededPremiumTransaction) {
    _owner = owner
  }

  override property get RICededPremium() : RICededPremium {
    return _owner.CPCededPremium
  }

  override property get RICededPremiumHistory() : RICededPremiumHistory {
    return _owner.CPCededPremiumHistory
  }
}
