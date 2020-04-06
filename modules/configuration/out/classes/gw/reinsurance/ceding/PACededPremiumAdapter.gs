package gw.reinsurance.ceding

@Export
class PACededPremiumAdapter extends AbstractCededPremiumAdapter<PACededPremium,PACededPremiumHistory> {
  construct(owner : PACededPremium) {
    super(owner)
  }

  override property get Cedings() : RICededPremiumTransaction[] {
    return _owner.CedingTransactions
  }

  override property get History(): RICededPremiumHistory[] {
    return _owner.CedingHistory
  }

  override property get Cost() : Cost {
    return _owner.PACost
  }

  override function createRawCedingTransaction(owner : PACededPremium, calcHistory : PACededPremiumHistory) : RICededPremiumTransaction {
    var txn = new PACededPremiumTransaction(owner.Bundle)
    txn.PACededPremium = owner
    txn.PACededPremiumHistory = calcHistory
    
    return txn
  }

  override function createRawHistoryRecord(owner : PACededPremium) : RICededPremiumHistory {
    var calcHistory = new PACededPremiumHistory(owner.Bundle)
    calcHistory.PACededPremium = owner
    
    return calcHistory
  }
}
