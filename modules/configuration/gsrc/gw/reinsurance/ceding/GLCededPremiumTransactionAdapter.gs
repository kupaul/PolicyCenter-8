package gw.reinsurance.ceding
uses gw.api.reinsurance.RICededPremiumTxnAdapter

@Export
class GLCededPremiumTransactionAdapter implements RICededPremiumTxnAdapter {

  protected var _owner : GLCededPremiumTransaction
  construct(owner : GLCededPremiumTransaction) {
    _owner = owner
  }

  override property get RICededPremium() : RICededPremium {
    return _owner.GLCededPremium
  }

  override property get RICededPremiumHistory() : RICededPremiumHistory {
    return _owner.GLCededPremiumHistory
  }
}
