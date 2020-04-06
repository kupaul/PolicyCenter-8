package gw.lob.gl.rating
uses gw.pl.persistence.core.effdate.EffDatedVersionList
uses java.util.Date
uses gw.api.effdate.EffDatedUtil
uses entity.windowed.GeneralLiabilityCovVersionList
uses entity.windowed.GLCovCostVersionList
uses gw.financials.PolicyPeriodFXRateCache

@Export
class GLCovExposureCostData extends GLCostData<GLCovExposureCost> {
  var _covID : Key
  var _exposureID : Key
  var _basisScalable : boolean

  construct(effDate : DateTime, expDate : DateTime, __state : Jurisdiction, covID : Key, exposureID : Key,
            basisScalable : boolean, __subline : GLCostSubline, __splitType : GLCostSplitType) {
    super(effDate, expDate, __state, __subline, __splitType)
    assertKeyType(covID, GeneralLiabilityCov)
    assertKeyType(exposureID, GLExposure)
    init(covID, exposureID, basisScalable)
  }

  construct(effDate : DateTime, expDate : DateTime, c : Currency, rateCache : PolicyPeriodFXRateCache, __state : Jurisdiction,
            covID : Key, exposureID : Key, basisScalable : boolean, __subline : GLCostSubline, __splitType : GLCostSplitType) {
    super(effDate, expDate, c, rateCache, __state, __subline, __splitType)
    assertKeyType(covID, GeneralLiabilityCov)
    assertKeyType(exposureID, GLExposure)
    init(covID, exposureID, basisScalable)
  }

  construct(cost : GLCovExposureCost) {
    super(cost)
    init(cost.GeneralLiabilityCov.FixedId, cost.GLExposure.FixedId, cost.GLExposure.ClassCode.Basis.Auditable)
  }

  construct(cost : GLCovExposureCost, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
    init(cost.GeneralLiabilityCov.FixedId, cost.GLExposure.FixedId, cost.GLExposure.ClassCode.Basis.Auditable)
  }

  private function init(covID : Key, exposureID : Key, basisScalable : boolean) {
    _covID = covID
    _exposureID = exposureID
    _basisScalable = basisScalable
  }

  override function setSpecificFieldsOnCost(line : GeneralLiabilityLine, costEntity: GLCovExposureCost ) : void {
    super.setSpecificFieldsOnCost(line, costEntity)
    costEntity.setFieldValue("GeneralLiabilityCov", _covID)
    costEntity.setFieldValue("GLExposure", _exposureID)
  }

  override function getVersionedCosts(line : GeneralLiabilityLine) : List<EffDatedVersionList> {
    var covVL = EffDatedUtil.createVersionList( line.Branch, _covID ) as GeneralLiabilityCovVersionList
    return covVL.Costs.where(\ costVL -> isCostVersionListForExposureSublineSplitType( costVL ))
  }

  private function isCostVersionListForExposureSublineSplitType(costVL : GLCovCostVersionList) : boolean {
    var v1 = costVL.AllVersions.first()
    return v1 typeis GLCovExposureCost 
        and v1.GLExposure.FixedId == _exposureID 
        and v1.Subline == Subline 
        and v1.SplitType == SplitType
  }

  override function toString() : String {
    return "Cov: ${_covID} Exp: ${_exposureID} "
        + "Subline: ${Subline} SplitType: ${SplitType} "
        + "StartDate: ${EffectiveDate} EndDate: ${ExpirationDate}"
  }

  override property get GLKeyValues() : List<Object> {
    return {_covID, _exposureID}  
  }
  
  override property get MergeAsBasisScalable() : boolean {
    return _basisScalable  
  }
}
