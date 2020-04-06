package gw.lob.bop.rating
uses java.util.Date
uses gw.api.effdate.EffDatedUtil
uses entity.windowed.BOPLocationCovVersionList
uses gw.financials.PolicyPeriodFXRateCache

@Export
class BOPMoneySecCovCostData extends BOPCostData<BOPMoneySecCovCost> {
  
  var _covID : Key
  var _onPremises : boolean
  
  construct(effDate : Date, expDate : Date, stateArg : Jurisdiction, covID : Key, onPremises : boolean) {
    super(effDate, expDate, stateArg)
    assertKeyType(covID, BOPLocationCov)
    init(covID, onPremises)
  }  

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, stateArg : Jurisdiction, covID : Key, onPremises : boolean) {
    super(effDate, expDate, c, rateCache, stateArg)
    assertKeyType(covID, BOPLocationCov)
    init(covID, onPremises)
  }  

  construct(cost : BOPMoneySecCovCost) {
    super(cost)
    init(cost.BOPLocationCov.FixedId, cost.OnPremises)
  }

  construct(cost : BOPMoneySecCovCost, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
    init(cost.BOPLocationCov.FixedId, cost.OnPremises)
  }

  private function init(covID : Key, onPremises : boolean) {
    _covID = covID
    _onPremises = onPremises
  }

  override function setSpecificFieldsOnCost(line : BOPLine, cost : BOPMoneySecCovCost) {
    super.setSpecificFieldsOnCost( line, cost )
    cost.setFieldValue("BOPLocationCov", _covID)
    cost.OnPremises = _onPremises
  }

  override function getVersionedCosts(line : BOPLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList( line.Branch, _covID ) as BOPLocationCovVersionList
    return covVL.Costs.where(\ costVL -> isCostVersionListForOnPremises(costVL)).toList()
  }
  
  function isCostVersionListForOnPremises(costVL : entity.windowed.BOPLocationCovCostVersionList) : boolean {
    var firstVersion = costVL.AllVersions.first()
    return firstVersion typeis BOPMoneySecCovCost and firstVersion.OnPremises == _onPremises
  }
  
  protected override property get KeyValues() : List<Object> {
    return {_covID, _onPremises}
  }
}
