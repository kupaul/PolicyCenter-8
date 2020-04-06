package gw.lob.gl.rating
uses gw.pl.persistence.core.effdate.EffDatedVersionList
uses entity.windowed.GLAddlInsuredCostVersionList
uses gw.financials.PolicyPeriodFXRateCache

@Export
class GLAddlInsuredCostData extends GLCostData<GLAddlInsuredCost> {
  var _addlInsuredID : Key
  
  construct(effDate : DateTime, expDate : DateTime, stateArg : Jurisdiction, addlInsuredID : Key,
            __subline : GLCostSubline, __splitType : GLCostSplitType) {
    super(effDate, expDate, stateArg, __subline, __splitType)
    assertKeyType(addlInsuredID, PolicyAddlInsured)
    init(addlInsuredID)
  }

  construct(effDate : DateTime, expDate : DateTime, c : Currency, rateCache : PolicyPeriodFXRateCache, stateArg : Jurisdiction,
            addlInsuredID : Key, __subline : GLCostSubline, __splitType : GLCostSplitType) {
    super(effDate, expDate, c, rateCache, stateArg, __subline, __splitType)
    assertKeyType(addlInsuredID, PolicyAddlInsured)
    init(addlInsuredID)
  }

  private function init(addlInsuredID : Key) {
    _addlInsuredID = addlInsuredID
  }
  
  override function setSpecificFieldsOnCost(line : GeneralLiabilityLine, cost: GLAddlInsuredCost ) : void {
    cost.setFieldValue("GeneralLiabilityLine", line.FixedId)
    cost.setFieldValue("AdditionalInsured", _addlInsuredID)
  }

  override function getVersionedCosts(line : GeneralLiabilityLine) : List<EffDatedVersionList> {
    var glCostVLs = line.VersionList.GLCosts
    return glCostVLs.whereTypeIs( GLAddlInsuredCostVersionList )
      .where( \ g -> g.AsOf(EffectiveDate).AdditionalInsured.FixedId == _addlInsuredID ).toList()
  }

  override property get GLKeyValues() : List<Object> {
    return {_addlInsuredID}  
  }
}
