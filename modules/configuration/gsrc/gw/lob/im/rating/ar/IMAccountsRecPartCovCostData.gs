package gw.lob.im.rating.ar

uses gw.pl.persistence.core.effdate.EffDatedVersionList
uses entity.windowed.IMAccountsRecPartCovVersionList
uses gw.api.effdate.EffDatedUtil
uses gw.lob.im.rating.IMCostData
uses gw.financials.PolicyPeriodFXRateCache

@Export
class IMAccountsRecPartCovCostData extends IMCostData<IMAccountsRecPartCovCost> {
  
  private var _cov : IMAccountsRecPartCov as Cov
  private var _covID : Key
  private var _partID : Key

  construct(effDate : DateTime, expDate : DateTime, covID : Key, partID : Key) {
    super(effDate, expDate)
    assertKeyType(covID, IMAccountsRecPartCov)
    assertKeyType(partID, IMAccountsRecPart)
    init(covID, partID)
  }

  construct(effDate : DateTime, expDate : DateTime, c : Currency, rateCache : PolicyPeriodFXRateCache, covID : Key, partID : Key) {
    super(effDate, expDate, c, rateCache)
    assertKeyType(covID, IMAccountsRecPartCov)
    assertKeyType(partID, IMAccountsRecPart)
    init(covID, partID)
  }

  private function init(covID : Key, partID : Key) {
    _covID = covID
    _partID = partID
  }
  
  override function getVersionedCosts(line: InlandMarineLine) : List<EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList(line.Branch, _covID) as IMAccountsRecPartCovVersionList
    return covVL.Costs
  }

  override function setSpecificFieldsOnCost(line: InlandMarineLine, cost: IMAccountsRecPartCovCost) : void {
    super.setSpecificFieldsOnCost(line, cost)
    cost.setFieldValue("IMAccountsRecPartCov", _covID)
    cost.setFieldValue("IMAccountsRecPart", _partID)
  }

  override property get KeyValues() : List<Object> {
    return {_covID}  
  }
}
