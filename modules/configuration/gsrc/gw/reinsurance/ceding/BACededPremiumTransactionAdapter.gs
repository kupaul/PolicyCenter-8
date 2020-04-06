package gw.reinsurance.ceding
uses gw.api.reinsurance.RICededPremiumTxnAdapter

@Export
class BACededPremiumTransactionAdapter implements RICededPremiumTxnAdapter {

  protected var _owner : BACededPremiumTransaction
  construct(owner : BACededPremiumTransaction) {
    _owner = owner
  }

  override property get RICededPremium() : RICededPremium {
    return _owner.BACededPremium
  }

  override property get RICededPremiumHistory() : RICededPremiumHistory {
    return _owner.BACededPremiumHistory
  }
}
