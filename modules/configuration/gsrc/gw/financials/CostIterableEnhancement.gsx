package gw.financials

uses gw.pl.currency.MonetaryAmount

uses java.lang.Iterable

/**
 * Additional aggregation utility methods for collections of costs.
 */
enhancement CostIterableEnhancement<T extends Cost> : Iterable<T> {

  function AmountSum(currency : Currency) : MonetaryAmount {
    return this.sum(currency, \ c -> c.ActualAmountBilling)
  }

  property get AnyProrated() : boolean {
    return this.hasMatch(\ c -> c.Prorated)
  }
}
