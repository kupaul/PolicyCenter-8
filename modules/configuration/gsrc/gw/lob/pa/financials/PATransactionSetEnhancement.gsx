package gw.lob.pa.financials
uses java.util.Set
uses java.util.Map
uses java.util.Collections

enhancement PATransactionSetEnhancement<T extends PATransaction> : Set<T>
{
  /**
   * Returns an AutoMap of vehicle garage locations to their transactions.  If the transactions refer to different versions of
   * the same location, then the latest persisted one is used as the key.  Any transactions that are not associated to
   * a vehicle garage location have a key value of null.  Lastly the AutoMap returns an empty set of transactions for
   * any key that is not in the map.
   */
  function byFixedLocation() : Map<PolicyLocation, Set<T>>
  {
    var locModelByFixedId = this.map( \ tx -> tx.PACost.Vehicle.GarageLocation )
                               .partition( \ loc -> loc.FixedId )
                               .mapValues( \ locs -> locs.maxBy( \ loc -> loc.ID ) )
    var ret = this.partition( \ tx -> locModelByFixedId.get(tx.PACost.Vehicle.GarageLocation.FixedId ) )
    return ret.toAutoMap( \ l -> Collections.emptySet<T>() )
  }
  
  /**
   * Returns an AutoMap of vehicles to their transactions.  If the transactions refer to different versions of
   * the same vehicle, then the latest persisted one is used as the key.  Any transactions that are not associated to
   * a vehicle have a key value of null.  Lastly the AutoMap returns an empty set of transactions for
   * any key that is not in the map.
   */
  function byFixedVehicle() : Map<PersonalVehicle, Set<T>>
  {
    var fixedIdToLocationMap = this.map( \ t -> t.PACost.Vehicle )
                                 .partition( \ v -> v.FixedId )
                                 .mapValues( \ list -> list.maxBy( \ v -> v.EffectiveDate ) )
    var ret = this.partition( \ t -> fixedIdToLocationMap.get( t.PACost.Vehicle.FixedId ) )
    return ret.toAutoMap( \ v -> Collections.emptySet<T>() )
  }
}
