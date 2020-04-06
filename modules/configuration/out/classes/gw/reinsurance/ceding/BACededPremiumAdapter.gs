package gw.reinsurance.ceding

@Export
class BACededPremiumAdapter extends AbstractCededPremiumAdapter<BACededPremium,BACededPremiumHistory> {
  construct(owner : BACededPremium) {
    super(owner)
  }

  override property get Cedings() : RICededPremiumTransaction[] {
    return _owner.CedingTransactions
  }

  override property get History(): RICededPremiumHistory[] {
    return _owner.CedingHistory
  }

  override property get Cost() : Cost {
    return _owner.BACost
  }

  override function createRawCedingTransaction(owner : BACededPremium, calcHistory : BACededPremiumHistory) : RICededPremiumTransaction {
    var txn = new BACededPremiumTransaction(owner.Bundle)
    txn.BACededPremium = owner
    txn.BACededPremiumHistory = calcHistory
    
    return txn
  }

  override function createRawHistoryRecord(owner : BACededPremium) : RICededPremiumHistory {
    var calcHistory = new BACededPremiumHistory(owner.Bundle)
    calcHistory.BACededPremium = owner
    
    return calcHistory
  }
}
