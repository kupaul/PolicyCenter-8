package gw.lob.bop.rating
uses java.util.Date
uses gw.financials.PolicyPeriodFXRateCache

@Export
class BOPAddnlInsuredCostData extends BOPCostData<BOPAddnlInsuredCost> {
  
  protected var _additionalInsuredID : Key
  
  construct(effDate : Date, expDate : Date, stateArg : Jurisdiction, additionalInsuredID : Key) {
    super(effDate, expDate, stateArg)
    assertKeyType(additionalInsuredID, PolicyAddlInsured)
    init(additionalInsuredID)
  }

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, stateArg : Jurisdiction, additionalInsuredID : Key) {
    super(effDate, expDate, c, rateCache, stateArg)
    assertKeyType(additionalInsuredID, PolicyAddlInsured)
    init(additionalInsuredID)
  }

  private function init(additionalInsuredID : Key) {
    _additionalInsuredID = additionalInsuredID
  }

  override function setSpecificFieldsOnCost(line : BOPLine, cost: BOPAddnlInsuredCost ) : void {
    super.setSpecificFieldsOnCost( line, cost )
    cost.setFieldValue("AdditionalInsured", _additionalInsuredID)
  }

  override function getVersionedCosts(line : BOPLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    return line.VersionList.BOPCosts.where( \ vl -> versionListMatches(vl)).toList()
  }

  private function versionListMatches(costVL : entity.windowed.BOPCostVersionList) : boolean {
    var first = costVL.AllVersions.first()
    return first typeis BOPAddnlInsuredCost and first.AdditionalInsured.FixedId == _additionalInsuredID  
  }

  protected override property get KeyValues() : List<Object> {
    return {_additionalInsuredID}
  }
}
