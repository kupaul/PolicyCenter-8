package gw.reinsurance.ceding

@Export
class BOPCededPremiumAdapter extends AbstractCededPremiumAdapter<BOPCededPremium,BOPCededPremiumHistory> {
  construct(owner : BOPCededPremium) {
    super(owner)
  }

  override property get Cedings() : RICededPremiumTransaction[] {
    return _owner.CedingTransactions
  }

  override property get History(): RICededPremiumHistory[] {
    return _owner.CedingHistory
  }

  override property get Cost() : Cost {
    return _owner.BOPCost
  }

  override function createRawCedingTransaction(owner : BOPCededPremium, calcHistory : BOPCededPremiumHistory) : RICededPremiumTransaction {
    var txn = new BOPCededPremiumTransaction(owner.Bundle)
    txn.BOPCededPremium = owner
    txn.BOPCededPremiumHistory = calcHistory
    
    return txn
  }

  override function createRawHistoryRecord(owner : BOPCededPremium) : RICededPremiumHistory {
    var calcHistory = new BOPCededPremiumHistory(owner.Bundle)
    calcHistory.BOPCededPremium = owner
    
    return calcHistory
  }
}
