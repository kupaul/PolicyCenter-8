package gw.lob.cp.financials
uses java.util.Set
uses java.util.Map
uses java.util.Collections

enhancement CPCostSetEnhancement<T extends CPCost> : Set<T> {
  /**
   * Returns an AutoMap of coverages to their costs.  If the costs refer to different versions of
   * the same coverage, then the latest persisted one is used as the key.  Any costs that are not associated to
   * a coverage have a key value of null.  Lastly the AutoMap returns an empty set of costs for
   * any key that is not in the map.
   */
  function byFixedCoverage() : Map<Coverage, Set<T>> {
    var covModelByFixedId = this.map( \ cost -> cost.Coverage )
                               .partition( \ cov -> cov.FixedId )
                               .mapValues( \ covs -> covs.maxBy( \ cov -> cov.ID ) )
    var ret = this.partition( \ cost -> covModelByFixedId.get(cost.Coverage.FixedId ) ).mapValues( \ v -> v.toSet() )
    return ret.toAutoMap( \ l -> Collections.emptySet<T>() )
  }

  /**
   * Returns an AutoMap of CP locations to their costs.  If the costs refer to different versions of
   * the same location, then the latest persisted one is used as the key.  Any costs that are not associated to
   * a CP location have a key value of null.  Lastly the AutoMap returns an empty set of costs for
   * any key that is not in the map.
   */
  function byFixedLocation() : Map<CPLocation, Set<T>> {
    var locModelByFixedId = this.map( \ cost -> cost.Location )
                               .partition( \ loc -> loc.FixedId )
                               .mapValues( \ locs -> locs.maxBy( \ loc -> loc.ID ) )
    var ret = this.partition( \ cost -> locModelByFixedId.get(cost.Location.FixedId ) ).mapValues( \ v -> v.toSet() )
    return ret.toAutoMap( \ l -> Collections.emptySet<T>() )
  }
  
  /**
   * Returns an AutoMap of CP buildings to their costs.  If the costs refer to different versions of
   * the same building, then the latest persisted one is used as the key.  Any costs that are not associated to
   * a building have a key value of null.  Lastly the AutoMap returns an empty set of costs for
   * any key that is not in the map.
   */
  function byFixedBuilding() : Map<CPBuilding, Set<T>> {
    var locModelByFixedId = this.map( \ cost -> cost.Building)
                               .partition( \ loc -> loc.FixedId )
                               .mapValues( \ locs -> locs.maxBy( \ loc -> loc.ID ) )
    var ret = this.partition( \ cost -> locModelByFixedId.get(cost.Building.FixedId ) ).mapValues(\v -> v.toSet())
    return ret.toAutoMap( \ l -> Collections.emptySet<T>() )
  }

}
