package gw.lob.gl.financials
uses java.util.Set
uses java.util.Map
uses java.util.Collections

enhancement GLTransactionSetEnhancement<T extends GLTransaction> : Set<T>
{
  /**
   * Returns an AutoMap of GL exposures' locations to their transactions.  If the costs refer to different versions of
   * the same location, then the latest persisted one is used as the key.  Any transactions that are not associated to
   * a GL exposure location have a key value of null.  Lastly the AutoMap returns an empty set of transactions for
   * any key that is not in the map.
   */
  function byFixedLocation() : Map<PolicyLocation, Set<T>>
  {
    var locModelByFixedId = this.map( \ tx -> tx.GLCost.Location )
                               .partition( \ loc -> loc.FixedId )
                               .mapValues( \ locs -> locs.maxBy( \ loc -> loc.ID ) )
    var ret = this.partition( \ tx -> locModelByFixedId.get(tx.GLCost.Location.FixedId ) ).mapValues(\v -> v.toSet())
    return ret.toAutoMap( \ l -> Collections.emptySet<T>() )
  }

}
