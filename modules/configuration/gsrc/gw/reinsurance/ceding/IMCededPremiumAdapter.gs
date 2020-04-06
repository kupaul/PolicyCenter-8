package gw.reinsurance.ceding

@Export
class IMCededPremiumAdapter extends AbstractCededPremiumAdapter<IMCededPremium,IMCededPremiumHistory> {
  construct(owner : IMCededPremium) {
    super(owner)
  }

  override property get Cedings() : RICededPremiumTransaction[] {
    return _owner.CedingTransactions
  }

  override property get History(): RICededPremiumHistory[] {
    return _owner.CedingHistory
  }

  override property get Cost() : Cost {
    return _owner.IMCost
  }

  override function createRawCedingTransaction(owner : IMCededPremium, calcHistory : IMCededPremiumHistory) : RICededPremiumTransaction {
    var txn = new IMCededPremiumTransaction(owner.Bundle)
    txn.IMCededPremium = owner
    txn.IMCededPremiumHistory = calcHistory
    
    return txn
  }

  override function createRawHistoryRecord(owner : IMCededPremium) : RICededPremiumHistory {
    var calcHistory = new IMCededPremiumHistory(owner.Bundle)
    calcHistory.IMCededPremium = owner
    
    return calcHistory
  }
}
