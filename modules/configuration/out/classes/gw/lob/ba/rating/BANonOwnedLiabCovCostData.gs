package gw.lob.ba.rating
uses java.util.Date
uses gw.api.effdate.EffDatedUtil
uses entity.windowed.BAStateCovVersionList
uses gw.financials.PolicyPeriodFXRateCache

@Export
@Deprecated("Deprecated in PC 7.0.1.  Not used in PC 7.0.  Use BALineCovNonownedCostData")
/**
* This Cost Data is no longer used OOTB
*/
class BANonOwnedLiabCovCostData extends BACostData<BANonOwnedLiabCovCost> {

  var _covID : Key
  var _costType : BANonOwnedLiabCovCostType
  
  construct(effDate : Date, expDate : Date, jurisdiction : BAJurisdiction, covIDArg : Key, costTypeArg : BANonOwnedLiabCovCostType) {
    super(effDate, expDate, "CoveragePremium", jurisdiction, null)
    assertKeyType(covIDArg, BAStateCov)
    init(covIDArg, costTypeArg)
  }

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, jurisdiction : BAJurisdiction, covIDArg : Key, costTypeArg : BANonOwnedLiabCovCostType) {
    super(effDate, expDate, c, rateCache, "CoveragePremium", jurisdiction, null)
    assertKeyType(covIDArg, BAStateCov)
    init(covIDArg, costTypeArg)
  }

  construct(cost : BANonOwnedLiabCovCost) {
    super(cost)
    init(cost.BAStateCov.FixedId, cost.BANonOwnedLiabCovCostType)
  }

  construct(cost : BANonOwnedLiabCovCost, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
    init(cost.BAStateCov.FixedId, cost.BANonOwnedLiabCovCostType)
  }

  private function init(covIDArg : Key, costTypeArg : BANonOwnedLiabCovCostType) {
    _covID = covIDArg
    _costType = costTypeArg
  }

  override function setSpecificFieldsOnCost(line : BusinessAutoLine, cost : BANonOwnedLiabCovCost) {
    super.setSpecificFieldsOnCost( line, cost )
    cost.setFieldValue("BAStateCov", _covID)
    cost.BANonOwnedLiabCovCostType = _costType
  }

  override function getVersionedCosts(line : BusinessAutoLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList( line.Branch, _covID ) as BAStateCovVersionList
    return covVL.Costs.where( \ costVL -> isCostVersionListForCostType(costVL)).toList()
  }
  
  protected override property get KeyValues() : List<Object> {
    return {_covID, _costType, JurisdictionArg}
  }
  
  private function isCostVersionListForCostType( costVL : entity.windowed.BAStateCovCostVersionList) : boolean {
    var firstVersion = costVL.AllVersions.first()
    return firstVersion typeis BANonOwnedLiabCovCost and firstVersion.BANonOwnedLiabCovCostType == _costType
              and firstVersion.Jurisdiction.FixedId == JurisdictionArg.FixedId
  }
}
