package gw.lob.bop.financials
uses java.util.Map
uses java.util.Set
uses java.util.Collections

enhancement BOPCostSetEnhancement<T extends BOPCost> : Set<T>
{
  /**
   * Returns an AutoMap of boolean (indicating if a cost is a coverage premium)
   * to their costs.  The AutoMap returns an empty set of costs for any key
   * that is not in the map.
   */
  function byCoveragePremium() : Map<Boolean, Set<T>>
  {
    var ret = this.partition( \ c -> c typeis BOPCoveragePremium ).mapValues(\v -> v.toSet())
    return ret.toAutoMap( \ b -> Collections.emptySet<T>() )
  }
  
  /**
   * Returns an AutoMap of locations to their costs.  If the costs refer to
   * different versions of the same location, then the latest persisted one is
   * used as the key.  Any costs that are not associated to a location have a key
   * value of null.  Lastly, the AutoMap returns an empty set of costs for
   * any key that is not in the map.
   */
  function byFixedLocation() : Map<BOPLocation, Set<T>>
  {
    var locations = this.map( \ c -> c.Location )
    var fixedIdToLocationMap = locations.partition( \ l -> l.FixedId ).mapValues( \ list -> list.maxBy( \ l -> l.ID ) )
    var ret = this.partition( \ c -> fixedIdToLocationMap.get( c.Location.FixedId ) ).mapValues( \ v -> v.toSet()  )
    return ret.toAutoMap( \ b -> Collections.emptySet<T>() )
  }
  
  /**
   * Returns an AutoMap of buildings to their costs.  If the costs refer to
   * different versions of the same building, then the latest persisted one is
   * used as the key.  Any costs that are not associated to a building have a key
   * value of null.  Lastly, the AutoMap returns an empty set of costs for
   * any key that is not in the map.
   */
  function byFixedBuilding() : Map<BOPBuilding, Set<T>>
  {
    var buildings = this.map( \ c -> c.Building )
    var fixedIdToBuildingMap = buildings.partition( \ l -> l.FixedId ).mapValues( \ list -> list.maxBy( \ l -> l.ID ) )
    var ret =  this.partition( \ c -> fixedIdToBuildingMap.get( c.Building.FixedId ) ).mapValues( \ v -> v.toSet()  )
    return ret.toAutoMap( \ b -> Collections.emptySet<T>() )
  }
}