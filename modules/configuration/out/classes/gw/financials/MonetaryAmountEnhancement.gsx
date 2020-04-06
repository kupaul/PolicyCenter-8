package gw.financials

uses java.math.BigDecimal
uses java.lang.IllegalArgumentException
uses gw.pl.currency.MonetaryAmount

/**
 * Provides additional properties and functionality to {@link gw.pl.currency.MonetaryAmount}. It provides information
 * about the amount value and currency.
 */
enhancement MonetaryAmountEnhancement : gw.pl.currency.MonetaryAmount {

  /**
   * @return <code>true</code> if the amount is zero; <code>false</code> otherwise.
   */
  property get IsZero() : boolean {
    return this.Amount == 0
  }

  /**
   * @return <code>true</code> if the amount is not zero; <code>false</code> otherwise.
   */
  property get IsNotZero() : boolean {
    return this.Amount != 0
  }

  /**
   * @return <code>true</code> if the amount is negative; <code>false</code> otherwise.
   */
  property get IsNegative() : boolean {
    return this.Amount.compareTo(BigDecimal.ZERO) < 0
  }  

  /**
   * @return <code>true</code> if the amount is positive; <code>false</code> otherwise.
   */
  property get IsPositive() : boolean {
    return this.Amount.compareTo(BigDecimal.ZERO) > 0
  }

  /**
   * Add to this amount. This is a convenience method and makes this:
   *
   * <code>this.add(new BigDecimal(23))</code>
   *
   * semantically equivalent to
   *
   * <code></code>this.add(new MonetaryAmount(new BigDecimal(23), this.getCurrency())</code>
   *
   * @param amount the amount to be added
   * @return A {@link MonetaryAmount} where <code>getAmount() == this.getAmount().add(amount)</code> and
   * <code>getCurrency() == this.getCurrency()</code>
   */
  function subtractAsSameCurrency(amount : BigDecimal) : MonetaryAmount {
    var resultCurrency = determineCurrencyFromAllowedCombination(this.Amount, this.Currency, amount, this.Currency);
    var retVal = new MonetaryAmount(this.getAmount().subtract(amount), resultCurrency);
    return(retVal);
  }

  /**
   * Determines the resulting currency if a binary operation is performed on two currencies.
   *
   * @param lhsAmount amount of the left operand
   * @param lhsCurrency currency of the left operand
   * @param rhsAmount amount of the right operand
   * @param rhsCurrency currency of the right operand
   * @return the resulting currency
   * @throws IllegalArgumentException if the specified currencies cannot not be used together in a binary operation
   */
  function determineCurrencyFromAllowedCombination(lhsAmount : BigDecimal, lhsCurrency : Currency,
                                                   rhsAmount: BigDecimal, rhsCurrency : Currency): Currency
  {
    var assigned = false
    var retVal : Currency
    // Optimization. Almost all calls will be satisfied right here...
    if(lhsCurrency != null && lhsCurrency.equals(rhsCurrency)) {
      assigned = true
      retVal = lhsCurrency
    } else if(lhsAmount.signum() == 0) {
      if(lhsCurrency == null){
        if(rhsAmount.signum() == 0) {
          assigned = true
          retVal = rhsCurrency
        } else if(rhsCurrency != null) {
          // rhsAmount must be non-zero
          assigned = true
          retVal = rhsCurrency
        }
      }
    } else {
      // lhs is a non-zero amount
      if(rhsAmount.signum() == 0) {
        // zero can have null or the same currency, but no other
        if(rhsCurrency == null || lhsCurrency.equals(rhsCurrency)) {
          assigned = true;
          retVal = lhsCurrency
        }
      }
      else if(lhsCurrency.equals(rhsCurrency)) {
        assigned = true
        retVal = lhsCurrency
      }
    }

    if(assigned == false){
      var msg = "Illegal combination of elements given to CurrencyAmount (lhs amount = ${lhsAmount})(lhs currency=${lhsCurrency}) (rhs amount=${rhsAmount})(rhs currency=${rhsCurrency})"
      throw(new IllegalArgumentException(msg))
    }
    return retVal
  }

}