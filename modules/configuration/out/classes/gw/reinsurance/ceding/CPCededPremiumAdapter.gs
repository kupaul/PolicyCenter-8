package gw.reinsurance.ceding

@Export
class CPCededPremiumAdapter extends AbstractCededPremiumAdapter<CPCededPremium,CPCededPremiumHistory> {
  construct(owner : CPCededPremium) {
    super(owner)
  }

  override property get Cedings() : RICededPremiumTransaction[] {
    return _owner.CedingTransactions
  }

  override property get History(): RICededPremiumHistory[] {
    return _owner.CedingHistory
  }

  override property get Cost() : Cost {
    return _owner.CPCost
  }

  override function createRawCedingTransaction(owner : CPCededPremium, calcHistory : CPCededPremiumHistory) : RICededPremiumTransaction {
    var txn = new CPCededPremiumTransaction(owner.Bundle)
    txn.CPCededPremium = owner
    txn.CPCededPremiumHistory = calcHistory
    
    return txn
  }

  override function createRawHistoryRecord(owner : CPCededPremium) : RICededPremiumHistory {
    var calcHistory = new CPCededPremiumHistory(owner.Bundle)
    calcHistory.CPCededPremium = owner
    
    return calcHistory
  }
}
