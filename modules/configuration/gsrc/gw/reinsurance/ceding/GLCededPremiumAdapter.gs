package gw.reinsurance.ceding

@Export
class GLCededPremiumAdapter extends AbstractCededPremiumAdapter<GLCededPremium,GLCededPremiumHistory> {
  construct(owner : GLCededPremium) {
    super(owner)
  }

  override property get Cedings() : RICededPremiumTransaction[] {
    return _owner.CedingTransactions
  }

  override property get History(): RICededPremiumHistory[] {
    return _owner.CedingHistory
  }

  override property get Cost() : Cost {
    return _owner.GLCost
  }

  override function createRawCedingTransaction(owner : GLCededPremium, calcHistory : GLCededPremiumHistory) : RICededPremiumTransaction {
    var txn = new GLCededPremiumTransaction(owner.Bundle)
    txn.GLCededPremium = owner
    txn.GLCededPremiumHistory = calcHistory
    
    return txn
  }

  override function createRawHistoryRecord(owner : GLCededPremium) : RICededPremiumHistory {
    var calcHistory = new GLCededPremiumHistory(owner.Bundle)
    calcHistory.GLCededPremium = owner
    
    return calcHistory
  }
}
