package gw.lob.pa.rating
uses java.util.Date
uses entity.windowed.PersonalAutoCovVersionList
uses gw.api.effdate.EffDatedUtil
uses gw.financials.PolicyPeriodFXRateCache

@Export
class PersonalAutoCovCostData extends PACostData<PersonalAutoCovCost> {
  
  var _vehicleID : Key
  var _covID : Key
  
  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, vehicleIDArg : Key, covIDArg : Key) {
    super(effDate, expDate, c, rateCache)
    init(vehicleIDArg, covIDArg)
  }

  construct(effDate : Date, expDate : Date, vehicleIDArg : Key, covIDArg : Key) {
    super(effDate, expDate)
    init(vehicleIDArg, covIDArg)
  }
  
  private function init(vehicleIDArg : Key, covIDArg : Key) {
    assertKeyType(vehicleIDArg, PersonalVehicle)
    assertKeyType(covIDArg, PersonalAutoCov)
    _vehicleID = vehicleIDArg
    _covID = covIDArg
  }

  construct(c : PersonalAutoCovCost) {
    super(c)
    _vehicleID = c.PersonalVehicle.FixedId
    _covID = c.PersonalAutoCov.FixedId
  }

  construct(c : PersonalAutoCovCost, rateCache : PolicyPeriodFXRateCache) {
    super(c, rateCache)
    _vehicleID = c.PersonalVehicle.FixedId
    _covID = c.PersonalAutoCov.FixedId 
  }

  override function setSpecificFieldsOnCost(line : PersonalAutoLine, cost : PersonalAutoCovCost) : void {
    super.setSpecificFieldsOnCost(line, cost)
    cost.setFieldValue( "PersonalAutoCov", _covID )  
    cost.setFieldValue( "PersonalVehicle", _vehicleID )      
  }

  override function getVersionedCosts(line : PersonalAutoLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList( line.Branch, _covID ) as PersonalAutoCovVersionList
    return covVL.Costs.where(\ costVL -> isCostVersionListForVehicle(costVL)).toList()
  }

  protected override property get KeyValues() : List<Object> {
    return {_vehicleID, _covID}
  }

  private function isCostVersionListForVehicle(costVL : entity.windowed.PersonalAutoCovCostVersionList) : boolean {
    var firstVersion = costVL.AllVersions.first()
    return firstVersion typeis PersonalAutoCovCost and firstVersion.Vehicle.FixedId == _vehicleID
  }

}
