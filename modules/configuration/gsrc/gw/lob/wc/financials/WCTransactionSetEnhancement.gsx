package gw.lob.wc.financials
uses java.util.Set
uses gw.lob.wc.rating.WCRatingPeriod

enhancement WCTransactionSetEnhancement<T extends WCTransaction> : Set<T>
{
  /**
   * Returns the transactions in this set that have an effective date in the rating period's [RatingStart, RatingEnd).
   */
  function byRatingPeriod( ratingPeriod : WCRatingPeriod ) : Set<T>
  {
    var start = ratingPeriod.RatingStart.trimToMidnight()
    var end   = ratingPeriod.RatingEnd.trimToMidnight()
    return this.where( \ tx -> (tx.EffDate >= start and tx.EffDate < end)
                      or (tx.EffDate == start and tx.EffDate == end)).toSet()
  }
  
  /**
   * Returns the transactions in this set that have a calcOrder in [calcOrder, endOrder].
   */
  function byCalcOrder( startOrder : int, endOrder : int ) : Set<T>
  {
    return this.where( \ tx -> tx.WCCost.CalcOrder >= startOrder and tx.WCCost.CalcOrder <= endOrder ).toSet()
  }
}
