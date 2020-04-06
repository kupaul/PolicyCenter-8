package gw.financials
uses java.util.Set

enhancement TransactionSetEnhancement<T extends Transaction> : Set<T> {

  /**
   * @return All members of the set where the RateAmountType of the cost is not TaxSurcharge
   */
  property get Premiums() : Set<T>
  {
    return this.where( \ tx -> tx.Cost.RateAmountType != "TaxSurcharge" ).toSet()
  }

  /**
   * @return All members of the set where the RateAmountType of the cost is TaxSurcharge
   */
  property get TaxSurcharges() : Set<T>
  {
    return this.where( \ tx -> tx.Cost.RateAmountType == "TaxSurcharge" ).toSet()
  }

  /**
   * @param t Type that is desired.
   * @return All members of the set which are compatible with the given type <code>t</code>.
   */
  function findByCostType( t : Type ) : Set<T>
  {
    return this.where( \ elt -> t.isAssignableFrom( typeof elt.Cost ) ).toSet()
  }
}
