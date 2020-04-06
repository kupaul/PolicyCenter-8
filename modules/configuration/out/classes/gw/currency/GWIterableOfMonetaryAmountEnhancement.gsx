package gw.currency

uses java.lang.IllegalArgumentException
uses gw.api.util.CurrencyUtil
uses gw.pl.currency.MonetaryAmount

/**
 *  Copyright 2012 Guidewire Software, Inc.
 */
@Export
enhancement GWIterableOfMonetaryAmountEnhancement : java.lang.Iterable<MonetaryAmount> {

  /**
   * Return the average of the MonetaryAmount elements,
   *   which must all be of the default currency.
   *
   * Delete this method if you are running Multi-Currency mode!
   */
  function average() : MonetaryAmount {
    return this.average( \ amt -> amt )
  }

  /**
   * Return the average of the MonetaryAmount elements,
   *   which must all be of the specified currency.
   */
  function average(currency : Currency) : MonetaryAmount {
    return this.average(currency, \ amt -> amt)
  }

  /**
   * Sums up the MonetaryAmount elements,
   *   which must all be of the default currency.
   *
   * Delete this method if you are running Multi-Currency mode!
   */
  function sum() : MonetaryAmount {
    return this.sum(CurrencyUtil.getDefaultCurrency())
  }

  /**
   * Sums up the MonetaryAmount elements,
   *   which must all be of the specified currency.
   */  
  function sum(currency : Currency) : MonetaryAmount {
    return this.sum(currency, \ amt -> amt)    
  }

  /**
   * Sums up the MonetaryAmount elements, which must all be of the same currency.
   * In addition the Iterable must have at least one non-null element to dynamically
   * determine the needed currency.
   *
   * MAKE SURE TO CALL THIS METHOD ONLY IF YOU KNOW THAT YOU HAVE AT LEAST ONE
   * NON-NULL MONETARYAMOUNT IN THE ITERABLE.
   */
  function sumWithAtLeastOneNonNullCurrency() : MonetaryAmount {
    var currency = this.firstWhere(\ ma -> ma != null).Currency
    if (currency == null) {
      throw new IllegalArgumentException("This Iterable needs to have at least one non-null MonetaryAmount")
    }
    return this.sum(currency, \ amt -> amt)
  }

}