package gw.lob.im.financials
uses java.util.Set
uses java.util.Map
uses java.util.Collections

enhancement IMTransactionSetEnhancement<T extends IMTransaction> : Set<T>
{
  /**
   * Returns an AutoMap of boolean (indicating if a transaction is a coverage premium)
   * to their transactions.  The AutoMap returns an empty set of transactions for any
   * key that is not in the map.
   */
  function bySignPartPremium() : Map<Boolean, Set<T>>
  {
    var ret = this.partition( \ t -> t.IMCost typeis IMSignPartCost ).mapValues( \ v -> v.toSet() )
    return ret.toAutoMap( \ b -> Collections.emptySet<T>() )
  }
  
  /**
   * Returns an AutoMap of locations to their transactions.  If the transactions refer to
   * different versions of the same location, then the latest persisted one is
   * used as the key.  Any transactions that are not associated to a location have a key
   * value of null.  Lastly, the AutoMap returns an empty set of transactions for
   * any key that is not in the map.
   */
  function byFixedSign() : Map<IMSign, Set<T>>
  {
    var sign = this.map( \ t -> (t.IMCost as IMSignCovCost).IMSignCov.IMSign )
    var fixedIdToSignMap = sign.partition( \ l -> l.FixedId ).mapValues( \ list -> list.maxBy( \ l -> l.EffectiveDate ) )
    var ret =  this.partition( \ t -> fixedIdToSignMap.get( (t.IMCost as IMSignCovCost).IMSignCov.IMSign.FixedId ) ).mapValues( \v -> v.toSet()  )
    return ret.toAutoMap( \ b -> Collections.emptySet<T>() )
  }

  function byFixedContractorsEquipment() : Map<ContractorsEquipment, Set<T>> {
    var equipments = this.map(\ t -> (t.IMCost as ContrEquipCovCost).ContractorsEquipCov.ContractorsEquipment)
    var fixedIdToEquipmentMap = equipments.partition(\ e -> e.FixedId).mapValues(\ i -> i.maxBy(\ e -> e.EffectiveDate))
    var equipmentToTxsMap = this.partition(\ t -> fixedIdToEquipmentMap.get((t.IMCost as ContrEquipCovCost).ContractorsEquipCov.ContractorsEquipment.FixedId))
    return equipmentToTxsMap.mapValues(\ v -> v.toSet())
  }

  function byFixedARItem() : Map<IMAccountsReceivable, Set<T>> {
    var arItems = this.map(\ t -> (t.IMCost as IMAccountsRecCovCost).IMAccountsRecCov.IMAccountsReceivable )
    var fixedIdToARItemMap = arItems.partition(\ e -> e.FixedId).mapValues(\ i -> i.maxBy(\ e -> e.EffectiveDate))
    var arItemToTxsMap = this.partition(\ t -> fixedIdToARItemMap.get((t.IMCost as IMAccountsRecCovCost).IMAccountsRecCov.IMAccountsReceivable.FixedId))
    return arItemToTxsMap.mapValues(\ v -> v.toSet())
  }
}
