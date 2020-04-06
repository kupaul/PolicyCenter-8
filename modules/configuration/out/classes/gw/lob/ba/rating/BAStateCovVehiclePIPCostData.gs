package gw.lob.ba.rating
uses java.util.Date
uses gw.api.effdate.EffDatedUtil
uses entity.windowed.BAStateCovVersionList
uses gw.financials.PolicyPeriodFXRateCache

@Export
/**
* This Cost Data is used only for PIP coverages - that is state coverages for PIP rated by vehicle
*/
class BAStateCovVehiclePIPCostData extends BACostData<BAStateCovVehiclePIPCost> {
  var _covID : Key
  var _costType : BAStateCovPIPCostType
  
  construct(effDate : Date, expDate : Date, jurisdiction : BAJurisdiction, covIDArg : Key,
                     vehicleIDArg : Key, costTypeArg : BAStateCovPIPCostType) {
    super(effDate, expDate, "CoveragePremium", jurisdiction, vehicleIDArg)
    assertKeyType(covIDArg, BAStateCov)
    assertKeyType(vehicleIDArg, BusinessVehicle)
    init(covIDArg, costTypeArg)
  }

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, jurisdiction : BAJurisdiction, covIDArg : Key,
                     vehicleIDArg : Key, costTypeArg : BAStateCovPIPCostType) {
    super(effDate, expDate, c, rateCache, "CoveragePremium", jurisdiction, vehicleIDArg)
    assertKeyType(covIDArg, BAStateCov)
    assertKeyType(vehicleIDArg, BusinessVehicle)
    init(covIDArg, costTypeArg)
  }

  construct(cost : BAStateCovVehiclePIPCost) {
    super(cost)
    init(cost.BAStateCov.FixedId, cost.BAStateCovPIPCostType)
  }

  construct(cost : BAStateCovVehiclePIPCost, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
    init(cost.BAStateCov.FixedId, cost.BAStateCovPIPCostType)
  }

  private function init(covIDArg : Key, costTypeArg : BAStateCovPIPCostType) {
    _covID = covIDArg
    _costType = costTypeArg
  }

  override function setSpecificFieldsOnCost(line : BusinessAutoLine, cost : BAStateCovVehiclePIPCost) : void {
    super.setSpecificFieldsOnCost( line, cost )
    cost.setFieldValue("BAStateCov", _covID)
    cost.setFieldValue("BAStateCovPIPCostType", _costType)
  }

  protected override property get KeyValues() : List<Object> {
    return {_covID, VehicleID, JurisdictionArg, _costType}
  }

  override function getVersionedCosts(line : BusinessAutoLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList( line.Branch, _covID ) as BAStateCovVersionList
    return covVL.Costs.where( \ costVL -> isCostVersionListForVehicle(costVL)).toList()
  }

  private function isCostVersionListForVehicle(costVL : entity.windowed.BAStateCovCostVersionList) : boolean {
    var firstVersion = costVL.AllVersions.first()
    return firstVersion typeis BAStateCovVehiclePIPCost and firstVersion.Vehicle.FixedId == VehicleID
          and firstVersion.BAStateCovPIPCostType == _costType 
  }
}
