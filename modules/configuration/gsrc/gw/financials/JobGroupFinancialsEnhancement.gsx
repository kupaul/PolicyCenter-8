package gw.financials

uses gw.pl.currency.MonetaryAmount

enhancement JobGroupFinancialsEnhancement : JobGroup {
 
  /**
   * The transaction amount sum for all active, validly quoted, jobs in this group.
   */
  property get AmountSum() : MonetaryAmount {
    var validPeriods = this.Jobs*.LatestPeriod.where( \ period -> period.Active and period.ValidQuote )
    var transactionSets = validPeriods.flatMap( \ p -> p.AllTransactions  )
    var currency = this.Account.PreferredSettlementCurrency
    return transactionSets.sum(currency, \ t -> t.Amount.convertAmount(currency) )
  }
}