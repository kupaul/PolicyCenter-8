package gw.lob.im.rating.ce

uses gw.pl.persistence.core.effdate.EffDatedVersionList
uses entity.windowed.ContractorsEquipCovVersionList
uses gw.api.effdate.EffDatedUtil
uses gw.lob.im.rating.IMCostData
uses java.util.Date
uses gw.financials.PolicyPeriodFXRateCache

@Export
class ContractorsEquipSchedCovCostData extends IMCostData<ContrEquipCovCost> {
  
  private var _covID : Key
  private var _partID : Key

  construct(effDate : DateTime, expDate : DateTime, covID : Key, partID : Key) {
    super(effDate, expDate)
    assertKeyType(covID, ContractorsEquipCov) 
    assertKeyType(partID, ContractorsEquipPart)
    init(covID, partID)
  }

  construct(effDate : DateTime, expDate : DateTime, c : Currency, rateCache : PolicyPeriodFXRateCache, covID : Key, partID : Key) {
    super(effDate, expDate, c, rateCache)
    assertKeyType(covID, ContractorsEquipCov) 
    assertKeyType(partID, ContractorsEquipPart)
    init(covID, partID)
  }

  private function init(covID : Key, partID : Key) {
    _covID = covID
    _partID = partID
  }

  override function setSpecificFieldsOnCost(line : InlandMarineLine, cost : ContrEquipCovCost) {
    super.setSpecificFieldsOnCost(line, cost)
    cost.setFieldValue("ContractorsEquipCov", _covID)
    cost.setFieldValue("ContractorsEquipPart", _partID)
  }

  override function getVersionedCosts(line : InlandMarineLine) : List<EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList(line.Branch, _covID) as ContractorsEquipCovVersionList
    return covVL.Costs
  }

  override property get KeyValues() : List<Object> {
    return {_covID}  
  }
}
