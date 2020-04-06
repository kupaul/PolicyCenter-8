package gw.lob.ba.rating
uses java.util.Date
uses gw.api.effdate.EffDatedUtil
uses entity.windowed.BusinessAutoCovVersionList
uses gw.financials.PolicyPeriodFXRateCache

@Export
/**
* This Cost Data is used only of Non Owned Liability Coveage
*/
class BALineCovNonownedCostData extends BACostData<BALineCovNonownedCost> {
  var _covID : Key
  var _costType : BANonOwnedLiabCovCostType as CostType
  
  construct(effDate : Date, expDate : Date, jurisdiction : BAJurisdiction, covIDArg : Key, costTypeArg : BANonOwnedLiabCovCostType) {
    super(effDate, expDate, "CoveragePremium", jurisdiction, null)
    assertKeyType(covIDArg, BusinessAutoCov)
    init(covIDArg, costTypeArg)
  }

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, jurisdiction : BAJurisdiction, covIDArg : Key, costTypeArg : BANonOwnedLiabCovCostType) {
    super(effDate, expDate, c, rateCache, "CoveragePremium", jurisdiction, null)
    assertKeyType(covIDArg, BusinessAutoCov)
    init(covIDArg, costTypeArg)
  }

  construct(cost : BALineCovNonownedCost) {
    super(cost)
    init(cost.BusinessAutoCov.FixedId, cost.BANonOwnedLiabCovCostType)
  }

  construct(cost : BALineCovNonownedCost, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
    init(cost.BusinessAutoCov.FixedId, cost.BANonOwnedLiabCovCostType)
  }

  private function init(covIDArg : Key, costTypeArg : BANonOwnedLiabCovCostType) {
    _covID = covIDArg   
    _costType = costTypeArg
  }

  override function setSpecificFieldsOnCost(line : BusinessAutoLine, cost : BALineCovNonownedCost) : void {
    super.setSpecificFieldsOnCost( line, cost )
    cost.setFieldValue("BusinessAutoCov", _covID)
    cost.setFieldValue("BANonOwnedLiabCovCostType", _costType)
  }

  override function getVersionedCosts(line : BusinessAutoLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList( line.Branch, _covID ) as BusinessAutoCovVersionList
    return covVL.Costs.where( \ costVL -> isCostVersionListForType(costVL)).toList()
  }

  protected override property get KeyValues() : List<Object> {
    return {_covID, _costType, JurisdictionArg}
  }

  private function isCostVersionListForType(costVL : entity.windowed.BALineCovCostVersionList) : boolean {
    var firstVersion = costVL.AllVersions.first()
    return firstVersion typeis BALineCovNonownedCost 
       and firstVersion.BANonOwnedLiabCovCostType == _costType
       and firstVersion.Jurisdiction.FixedId == JurisdictionArg.FixedId
  }
}
