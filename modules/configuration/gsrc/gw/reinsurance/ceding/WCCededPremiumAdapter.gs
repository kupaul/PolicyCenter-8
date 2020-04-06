package gw.reinsurance.ceding

@Export
class WCCededPremiumAdapter extends AbstractCededPremiumAdapter<WCCededPremium,WCCededPremiumHistory> {
  construct(owner : WCCededPremium) {
    super(owner)
  }

  override property get Cedings() : RICededPremiumTransaction[] {
    return _owner.CedingTransactions
  }

  override property get History(): RICededPremiumHistory[] {
    return _owner.CedingHistory
  }

  override property get Cost() : Cost {
    return _owner.WCCost
  }

  override function createRawCedingTransaction(owner : WCCededPremium, calcHistory : WCCededPremiumHistory) : RICededPremiumTransaction {
    var txn = new WCCededPremiumTransaction(owner.Bundle)
    txn.WCCededPremium = owner
    txn.WCCededPremiumHistory = calcHistory
    
    return txn
  }

  override function createRawHistoryRecord(owner : WCCededPremium) : RICededPremiumHistory {
    var calcHistory = new WCCededPremiumHistory(owner.Bundle)
    calcHistory.WCCededPremium = owner
    
    return calcHistory
  }
}
