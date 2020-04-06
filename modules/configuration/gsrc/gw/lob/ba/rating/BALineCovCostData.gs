package gw.lob.ba.rating
uses java.util.Date
uses gw.api.effdate.EffDatedUtil
uses entity.windowed.BusinessAutoCovVersionList
uses gw.financials.PolicyPeriodFXRateCache

@Export
/**
* This Cost Data is Line coverages, except for nonowned Liability
*/
class BALineCovCostData extends BACostData<BALineCovCost> {
   
   var _covID : Key

  construct(effDate : Date, expDate : Date, jurisdiction : BAJurisdiction, covIDArg : Key, vehicleIDArg : Key) {    
    super( effDate, expDate, "CoveragePremium", jurisdiction, vehicleIDArg)
    init(covIDArg)
  }

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, jurisdiction : BAJurisdiction, covIDArg : Key, vehicleIDArg : Key) {
    super( effDate, expDate, c, rateCache, "CoveragePremium", jurisdiction, vehicleIDArg)
    init(covIDArg)
  }
  
  private function init(covIDArg : Key) {
    assertKeyType(covIDArg, BusinessAutoCov)
    _covID = covIDArg   
  }

  construct(cost : BALineCovCost) {
    super(cost)
    _covID = cost.BusinessAutoCov.FixedId
  }

  construct(cost : BALineCovCost, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
    _covID = cost.BusinessAutoCov.FixedId
  }

  override function setSpecificFieldsOnCost(line : BusinessAutoLine, cost : BALineCovCost) : void {
    super.setSpecificFieldsOnCost( line, cost )
    cost.setFieldValue("BusinessAutoCov", _covID)
  }

  override function getVersionedCosts(line : BusinessAutoLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList( line.Branch, _covID ) as BusinessAutoCovVersionList
    var costVL = covVL.Costs.where( \ costVL -> isCostVersionListForVehOrJur(costVL)).toList()
    return costVL
  }
 
  private function isCostVersionListForVehOrJur(costVL : entity.windowed.BALineCovCostVersionList) : boolean {
    var firstVersion = costVL.AllVersions.first()
    return firstVersion.BusinessVehicle.FixedId == VehicleID and firstVersion.Jurisdiction.FixedId == JurisdictionArg.FixedId  
  }  
  
  protected override property get KeyValues() : List<Object> {
    return {_covID, VehicleID, JurisdictionArg}
  }
}
