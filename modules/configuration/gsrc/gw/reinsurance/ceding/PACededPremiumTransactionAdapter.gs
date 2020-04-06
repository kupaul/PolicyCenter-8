package gw.reinsurance.ceding
uses gw.api.reinsurance.RICededPremiumTxnAdapter

@Export
class PACededPremiumTransactionAdapter implements RICededPremiumTxnAdapter {

  protected var _owner : PACededPremiumTransaction
  construct(owner : PACededPremiumTransaction) {
    _owner = owner
  }

  override property get RICededPremium() : RICededPremium {
    return _owner.PACededPremium
  }

  override property get RICededPremiumHistory() : RICededPremiumHistory {
    return _owner.PACededPremiumHistory
  }
}
