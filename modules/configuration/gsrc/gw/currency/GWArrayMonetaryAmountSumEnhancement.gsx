package gw.currency

uses gw.api.util.CurrencyUtil
uses gw.pl.currency.MonetaryAmount
uses gw.util.GosuObjectUtil
uses java.util.Arrays

/**
 * The overloaded versions of the sum() method had to be moved to separate enhancements due to the way block type erasure
 * works (all blocks with the same arity have the same erasure).  Splitting the methods up into different enhancements
 * prevents them from conflicting, since they become part of different Java classes.
 *
 *  Copyright 2012 Guidewire Software, Inc.
 */
enhancement GWArrayMonetaryAmountSumEnhancement<T> : T[] {
  /**
   * Return the average of the values of the target of the mapper argument,
   *   which must all be of the default currency.
   *
   * Delete this method if you are running Multi-Currency mode!
   */
  function average( select:block(elt:T):MonetaryAmount ) : MonetaryAmount {
    return getList().average( select )
  }

  /**
   * Return the average of the values of the target of the mapper argument,
   *   which must all be of the same currency as specified.
   */
  function average( currency : Currency, select:block(elt:T):MonetaryAmount ) : MonetaryAmount {
    return getList().average( currency, select )
  }

  /**
   * Sums up the values of the target of the mapper argument,
   *   which must all be of the default currency.
   *
   * Delete this method if you are running Multi-Currency mode!
   */
  function sum( mapper(elt:T) : MonetaryAmount ) : MonetaryAmount {
    return this.sum(CurrencyUtil.getDefaultCurrency(), mapper)
  }

  /**
   * Sums up the values of the target of the mapper argument,
   *   which must all be of the same currency as specified.
   */
  function sum( currency : Currency, mapper(elt:T) : MonetaryAmount ) : MonetaryAmount {
    return getList().sum( currency, mapper )
  }

  // Cribbed from CoreArrayEnhancement.gsx:fastList()
  // Can't directly use fastList() as it is an internal function
  private function getList() : java.util.List<T> {
    if (GosuObjectUtil.isJavaReferenceArray(this)) {
      return Arrays.asList<T>(this)
    } else {
      return this.toList()
    }
  }
}