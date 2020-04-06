package gw.reinsurance.ceding
uses gw.api.reinsurance.RICededPremiumTxnAdapter

@Export
class IMCededPremiumTransactionAdapter implements RICededPremiumTxnAdapter {

  protected var _owner : IMCededPremiumTransaction
  construct(owner : IMCededPremiumTransaction) {
    _owner = owner
  }

  override property get RICededPremium() : RICededPremium {
    return _owner.IMCededPremium
  }

  override property get RICededPremiumHistory() : RICededPremiumHistory {
    return _owner.IMCededPremiumHistory
  }
}

