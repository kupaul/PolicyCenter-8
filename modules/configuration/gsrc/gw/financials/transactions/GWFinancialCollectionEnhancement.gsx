package gw.financials.transactions
uses java.util.Collection

enhancement GWFinancialCollectionEnhancement<T> : Collection<T> {

  /**
   * Map all elements of a collection to the same value, or generate error.
   */
  function mapSoleValue<Q>(mapper(t : T):Q, error(q1 : Q, q2 : Q)) : Q {
    var result = this.reduce( null, \ q, t -> {
      var q2 : Q = mapper(t)
      if (q != null and q != q2) {
        error(q as Q, q2)
        throw "Found at least 2 values: " + q + " and " + q2
      }
      return q2
    })
    return result as Q
  }
  
}
