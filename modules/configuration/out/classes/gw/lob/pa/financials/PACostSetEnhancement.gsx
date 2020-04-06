package gw.lob.pa.financials
uses java.util.Set
uses java.util.Map
uses java.util.Collections

enhancement PACostSetEnhancement<T extends PACost> : Set<T>
{
  /**
   * Returns an AutoMap of vehicle garage locations to their costs.  If the costs refer to different versions of
   * the same location, then the latest persisted one is used as the key.  Any costs that are not associated to
   * a vehicle garage location have a key value of null.  Lastly the AutoMap returns an empty set of costs for
   * any key that is not in the map.
   */
  function byFixedLocation() : Map<PolicyLocation, Set<T>>
  {
    var fixedIdToLocationMap = this.map( \ cost -> cost.Vehicle.GarageLocation )
                               .partition( \ loc -> loc.FixedId )
                               .mapValues( \ locs -> locs.maxBy( \ loc -> loc.ID ) )
    var ret = this.partition( \ cost -> fixedIdToLocationMap.get(cost.Vehicle.GarageLocation.FixedId ) )
    return ret.toAutoMap( \ l -> Collections.emptySet<T>() )
  }

  /**
   * Returns an AutoMap of vehicles to their costs.  If the costs refer to different versions of
   * the same vehicle, then the latest persisted one is used as the key.  Any costs that are not associated to
   * a vehicle have a key value of null.  Lastly the AutoMap returns an empty set of costs for
   * any key that is not in the map.
   */
  function byFixedVehicle() : Map<PersonalVehicle, Set<T>>
  {
    var fixedIdToVehicleMap = this.map( \ c -> c.Vehicle )
                                 .partition( \ v -> v.FixedId )
                                 .mapValues( \ list -> list.maxBy( \ v -> v.EffectiveDate ) )
    var ret = this.partition( \ c -> fixedIdToVehicleMap.get( c.Vehicle.FixedId ) )
    return ret.toAutoMap( \ v -> Collections.emptySet<T>() )
  }
}
