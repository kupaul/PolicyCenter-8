package gw.lob.pa.rating
uses java.util.Date
uses entity.windowed.PersonalAutoCovVersionList
uses gw.api.effdate.EffDatedUtil
uses gw.financials.PolicyPeriodFXRateCache

@Export
class PersonalAutoPIPCovCostData extends PACostData<PersonalAutoPIPCovCost> {
  
  var _vehicleID : Key
  var _covID : Key
  var _costType : PAPIPCovCostType as costType
  
  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, vehicleIDArg : Key, covIDArg : Key,
                            costTypeArg : PAPIPCovCostType) {
    super(effDate, expDate, c, rateCache)
    init(vehicleIDArg, covIDArg, costTypeArg)
  }

  construct(effDate : Date, expDate : Date, vehicleIDArg : Key, covIDArg : Key,
                            costTypeArg : PAPIPCovCostType) {
    super(effDate, expDate)
    init(vehicleIDArg, covIDArg, costTypeArg)
  }

  private function init(vehicleIDArg : Key, covIDArg : Key, costTypeArg : PAPIPCovCostType) {
    assertKeyType(vehicleIDArg, PersonalVehicle)
    assertKeyType(covIDArg, PersonalAutoCov)
    _vehicleID = vehicleIDArg
    _covID = covIDArg
    _costType = costTypeArg
  }

  construct(c : PersonalAutoPIPCovCost) {
    super(c)
    _vehicleID = c.PersonalVehicle.FixedId
    _covID = c.PersonalAutoCov.FixedId
    _costType = c.PAPIPCovCostType
  }

  construct(c : PersonalAutoPIPCovCost, rateCache : PolicyPeriodFXRateCache) {
    super(c, rateCache)
    _vehicleID = c.PersonalVehicle.FixedId
    _covID = c.PersonalAutoCov.FixedId
    _costType = c.PAPIPCovCostType
  }

  override function setSpecificFieldsOnCost(line : PersonalAutoLine, cost : PersonalAutoPIPCovCost) : void {
    super.setSpecificFieldsOnCost(line, cost)
    cost.setFieldValue( "PersonalAutoCov", _covID )  
    cost.setFieldValue( "PersonalVehicle", _vehicleID )
    cost.setFieldValue("PAPIPCovCostType", _costType)      
  }

  protected override property get KeyValues() : List<Object> {
    return {_vehicleID, _covID, _costType}
  }

  override function getVersionedCosts(line : PersonalAutoLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList( line.Branch, _covID ) as PersonalAutoCovVersionList
    return covVL.Costs.where(\ costVL -> isCostVersionListForVehicle(costVL)).toList()
  }

  private function isCostVersionListForVehicle(costVL : entity.windowed.PersonalAutoCovCostVersionList) : boolean {
    var firstVersion = costVL.AllVersions.first()
    return firstVersion typeis PersonalAutoPIPCovCost and firstVersion.Vehicle.FixedId == _vehicleID 
              and firstVersion.PAPIPCovCostType == _costType
  }

}
