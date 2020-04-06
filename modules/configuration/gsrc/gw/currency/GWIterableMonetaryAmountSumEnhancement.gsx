package gw.currency

uses gw.pl.currency.MonetaryAmount

uses java.math.BigDecimal

/**
 * The overloaded versions of the sum() method had to be moved to separate enhancements due to the way block type erasure
 * works (all blocks with the same arity have the same erasure).  Splitting the methods up into different enhancements
 * prevents them from conflicting, since they become part of different Java classes.
 *
 *  Copyright 2012 Guidewire Software, Inc.
 */
 @Export
 enhancement GWIterableMonetaryAmountSumEnhancement<T> : java.lang.Iterable<T> {
  /**
   * Return the average of the values of the target of the mapper argument,
   *   which must all be of the default currency.
   *
   * Delete this method if you are running Multi-Currency mode!
   */
  function average( select:block(elt:T):MonetaryAmount ) : MonetaryAmount {
     return this.sum( \ elt -> select(elt) ) / (this.Count as BigDecimal)
  }

  /**
   * Return the average of the values of the target of the mapper argument,
   *   which must all be of the same currency as specified.
   */
  function average( currency : Currency, select:block(elt:T):MonetaryAmount ) : MonetaryAmount {
    return this.sum(currency, \ elt -> select(elt) ) / (this.Count as BigDecimal)
  }

  /**
   * Sums up the values of the target of the mapper argument,
   *   which must all be of the default currency.
   *
   * Delete this method if you are running Multi-Currency mode!
   */
  function sum( mapper(elt:T):MonetaryAmount ) : MonetaryAmount {
    return this.sum(gw.api.util.CurrencyUtil.getDefaultCurrency(), mapper)
  }

  /**
   * Sums up the values of the target of the mapper argument,
   *   which must all be of the same currency as specified.
   */
  function sum( currency : Currency, mapper(elt:T) : MonetaryAmount ) : MonetaryAmount {
    var sum = new MonetaryAmount(0, currency)//TODO: 0bd.ofCurrency(currency)
    for (elt in this) {
      sum = sum.add(mapper( elt ))
    }
    return sum
  }
}