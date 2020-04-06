package gw.lob.ba.rating
uses java.util.Date
uses gw.api.effdate.EffDatedUtil
uses entity.windowed.BAStateCovVersionList
uses gw.financials.PolicyPeriodFXRateCache

@Export
/**
* This Cost Data is used for state coverages rated by vehicle, e.g. UM and UIM coverages
*/
class BAStateCovVehicleCostData extends BACostData<BAStateCovVehicleCost> {
  var _covID : Key
  
  construct(effDate : Date, expDate : Date, jurisdiction : BAJurisdiction, covIDArg : Key, vehicleIDArg : Key) {
    super(effDate, expDate, "CoveragePremium", jurisdiction, vehicleIDArg)
    assertKeyType(covIDArg, BAStateCov)
    assertKeyType(vehicleIDArg, BusinessVehicle)
    init(covIDArg)
  }

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, jurisdiction : BAJurisdiction, covIDArg : Key, vehicleIDArg : Key) {
    super(effDate, expDate, c, rateCache, "CoveragePremium", jurisdiction, vehicleIDArg)
    assertKeyType(covIDArg, BAStateCov)
    assertKeyType(vehicleIDArg, BusinessVehicle)
    init(covIDArg)
  }

  construct(cost : BAStateCovVehicleCost) {
    super(cost)
    init(cost.BAStateCov.FixedId)
  }

  construct(cost : BAStateCovVehicleCost, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
    init(cost.BAStateCov.FixedId)
  }

  private function init(covIDArg : Key) {
    _covID = covIDArg
  }

  override function setSpecificFieldsOnCost(line : BusinessAutoLine, cost : BAStateCovVehicleCost) : void {
    super.setSpecificFieldsOnCost( line, cost )
    cost.setFieldValue("BAStateCov", _covID)
  }

  override function getVersionedCosts(line : BusinessAutoLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList( line.Branch, _covID ) as BAStateCovVersionList
    return covVL.Costs.where( \ costVL -> isCostVersionListForVehicle(costVL)).toList()
  }

  protected override property get KeyValues() : List<Object> {
    return {_covID, VehicleID, JurisdictionArg}
  }

  private function isCostVersionListForVehicle(costVL : entity.windowed.BAStateCovCostVersionList) : boolean {
    var firstVersion = costVL.AllVersions.first()
    return firstVersion typeis BAStateCovVehicleCost and firstVersion.Vehicle.FixedId == VehicleID
  }
  
}
