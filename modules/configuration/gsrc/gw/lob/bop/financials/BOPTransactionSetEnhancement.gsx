package gw.lob.bop.financials
uses java.util.Set
uses java.util.Map
uses java.util.Collections

enhancement BOPTransactionSetEnhancement<T extends BOPTransaction> : Set<T>
{
  /**
   * Returns an AutoMap of boolean (indicating if a transaction is a coverage premium)
   * to their transactions.  The AutoMap returns an empty set of transactions for any
   * key that is not in the map.
   */
  function byCoveragePremium() : Map<Boolean, Set<T>>
  {
    var ret = this.partition( \ t -> t.BOPCost typeis BOPCoveragePremium ).mapValues( \ v -> v.toSet()  )
    return ret.toAutoMap( \ b -> Collections.emptySet<T>() )
  }
  
  /**
   * Returns an AutoMap of locations to their transactions.  If the transactions refer to
   * different versions of the same location, then the latest persisted one is
   * used as the key.  Any transactions that are not associated to a location have a key
   * value of null.  Lastly, the AutoMap returns an empty set of transactions for
   * any key that is not in the map.
   */
  function byFixedLocation() : Map<BOPLocation, Set<T>>
  {
    var locations = this.map( \ t -> t.BOPCost.Location )
    var fixedIdToLocationMap = locations.partition( \ l -> l.FixedId ).mapValues( \ list -> list.maxBy( \ l -> l.EffectiveDate ) )
    var ret =  this.partition( \ t -> fixedIdToLocationMap.get( t.BOPCost.Location.FixedId ) ).mapValues(\v -> v.toSet())
    return ret.toAutoMap( \ b -> Collections.emptySet<T>() )
  }
  
  /**
   * Returns an AutoMap of buildings to their transactions.  If the transactions refer to
   * different versions of the same building, then the latest persisted one is
   * used as the key.  Any transactions that are not associated to a building have a key
   * value of null.  Lastly, the AutoMap returns an empty set of transactions for
   * any key that is not in the map.
   */
  function byFixedBuilding() : Map<BOPBuilding, Set<T>>
  {
    var buildings = this.map( \ t -> t.BOPCost.Building )
    var fixedIdToBuildingMap = buildings.partition( \ l -> l.FixedId ).mapValues( \ list -> list.maxBy( \ l -> l.EffectiveDate ) )
    var ret = this.partition( \ t -> fixedIdToBuildingMap.get( t.BOPCost.Building.FixedId ) ).mapValues(\v -> v.toSet())
    return ret.toAutoMap( \ b -> Collections.emptySet<T>() )
  }
}
