package gw.api.domain.financials

enhancement TransactionEnhancement : entity.Transaction {
  static property get finder() : TransactionFinder {
    return TransactionFinder.instance
  }
  
  property get CoverageCurrency() : Currency {
    return this.Cost.CoverageCurrency
  }
  
  property get SettlementCurrency() : Currency {
    return this.Cost.SettlementCurrency
  }
  
}
