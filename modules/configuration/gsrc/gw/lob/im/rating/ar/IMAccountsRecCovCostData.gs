package gw.lob.im.rating.ar

uses gw.pl.persistence.core.effdate.EffDatedVersionList
uses entity.windowed.IMAccountsRecCovVersionList
uses gw.api.effdate.EffDatedUtil
uses gw.lob.im.rating.IMCostData
uses gw.financials.PolicyPeriodFXRateCache

@Export
class IMAccountsRecCovCostData  extends IMCostData<IMAccountsRecCovCost> {

  private var _cov : IMAccountsRecCov as Cov
  private var _covID : Key
  private var _partID : Key

  construct(effDate : DateTime, expDate : DateTime, covID : Key, partID : Key) {
    super(effDate, expDate)
    assertKeyType(covID, IMAccountsRecCov)
    assertKeyType(partID, IMAccountsRecPart)
    init(covID, partID)
  }

  construct(effDate : DateTime, expDate : DateTime, c : Currency, rateCache : PolicyPeriodFXRateCache, covID : Key, partID : Key) {
    super(effDate, expDate, c, rateCache)
    assertKeyType(covID, IMAccountsRecCov)
    assertKeyType(partID, IMAccountsRecPart)
    init(covID, partID)
  }

  private function init(covID : Key, partID : Key) {
    _covID = covID
    _partID = partID
  }
  
  override function getVersionedCosts(line: InlandMarineLine) : List<EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList(line.Branch, _covID) as IMAccountsRecCovVersionList
    return covVL.Costs
  }

  override function setSpecificFieldsOnCost(line: InlandMarineLine, cost: IMAccountsRecCovCost) : void {
    super.setSpecificFieldsOnCost(line, cost)
    cost.setFieldValue("IMAccountsRecCov", _covID)
    cost.setFieldValue("IMAccountsRecPart", _partID)
  }

  override property get KeyValues() : List<Object> {
    return {_covID}  
  }
}
