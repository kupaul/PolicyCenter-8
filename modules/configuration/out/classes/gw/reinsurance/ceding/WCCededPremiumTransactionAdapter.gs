package gw.reinsurance.ceding
uses gw.api.reinsurance.RICededPremiumTxnAdapter

@Export
class WCCededPremiumTransactionAdapter implements RICededPremiumTxnAdapter {

  protected var _owner : WCCededPremiumTransaction
  construct(owner : WCCededPremiumTransaction) {
    _owner = owner
  }

  override property get RICededPremium() : RICededPremium {
    return _owner.WCCededPremium
  }

  override property get RICededPremiumHistory() : RICededPremiumHistory {
    return _owner.WCCededPremiumHistory
  }
}
