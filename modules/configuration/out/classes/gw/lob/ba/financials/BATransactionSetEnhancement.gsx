package gw.lob.ba.financials
uses java.util.Set
uses java.util.Map
uses java.util.Collections

enhancement BATransactionSetEnhancement<T extends BATransaction> : Set<T>
{
  /**
   * Partitions the transaction set into an AutoMap of four groups:
   * 1. "StateCovPremium"   - lump-sump premiums for a state coverage
   * 2. "VehicleCovPremium" - premiums by vehicle; either the transaction for a business vehicle coverage or a state coverage priced by vehicle
   * 3. "NonCovPremium"     - non-coverage premiums like minimum premiums, short-rate penalties, etc
   * 4. "StateTax"          - state taxes
   * The AutoMap returns an empty set of transactions for any key that is not in the map.
   */
  function byHighLevelCostTypes() : Map<String, Set<T>>
  {
    var ret = this.partition( \ tx -> getHighLevelCostPartitionKey( tx ) ).mapValues( \v -> v.toSet()  )
    return ret.toAutoMap( \ o -> Collections.emptySet<T>() )
  }
  
  private function getHighLevelCostPartitionKey( tx : T ) : String
  {
    var ratedOrder = tx.BACost.RatedOrder.Priority
    if ( ratedOrder <= ("CoveragePremium" as BARatedOrderType).Priority )
    {
      return tx.BACost.Vehicle == null ? "StateCovPremium" : "VehicleCovPremium"
    }
    else if ( ratedOrder < ("StateTax" as BARatedOrderType).Priority )
    {
      return "NonCovPremium"
    }
    return "StateTax"
  }
  
  /**
   * Returns an AutoMap of vehicle garage locations to their transactions.  If the transactions refer to different versions of
   * the same location, then the latest persisted one is used as the key.  Any transactions that are not associated to
   * a vehicle garage location have a key value of null.  Lastly the AutoMap returns an empty set of transactions for
   * any key that is not in the map.
   */
  function byFixedLocation() : Map<PolicyLocation, Set<T>>
  {
    var locModelByFixedId = this.map( \ tx -> tx.BACost.Vehicle.Location )
                               .partition( \ loc -> loc.FixedId )
                               .mapValues( \ locs -> locs.maxBy( \ loc -> loc.ID ) )
    var ret = this.partition( \ tx -> locModelByFixedId.get(tx.BACost.Vehicle.Location.FixedId ) ).mapValues(\v -> v.toSet())
    return ret.toAutoMap( \ l -> Collections.emptySet<T>() )
  }
  
  /**
   * Returns an AutoMap of vehicles to their transactions.  If the transactions refer to different versions of
   * the same vehicle, then the latest persisted one is used as the key.  Any transactions that are not associated to
   * a vehicle have a key value of null.  Lastly the AutoMap returns an empty set of transactions for
   * any key that is not in the map.
   */
  function byFixedVehicle() : Map<BusinessVehicle, Set<T>>
  {
    var vehModelByFixedId = this.map( \ tx -> tx.BACost.Vehicle )
                               .partition( \ v -> v.FixedId )
                               .mapValues( \ vs -> vs.maxBy( \ v -> v.ID ) )
    var ret =  this.partition( \ tx -> vehModelByFixedId.get(tx.BACost.Vehicle.FixedId ) ).mapValues(\v -> v.toSet())
    return ret.toAutoMap( \ l -> Collections.emptySet<T>() )
  }
  
}
