package gw.lob.gl.rating
uses gw.rating.CostData
uses gw.financials.PolicyPeriodFXRateCache

@Export
abstract class GLCostData<T extends GLCost> extends CostData<T, GeneralLiabilityLine> {
  var _subline : GLCostSubline as Subline
  var _splitType : GLCostSplitType as SplitType
  var _state : Jurisdiction as State

  construct(effDate : DateTime, expDate : DateTime, __state : Jurisdiction,
            __subline : GLCostSubline, __splitType : GLCostSplitType) {
    super(effDate, expDate)
    _state = __state
    _subline = __subline
    _splitType = __splitType
  }

  construct(effDate : DateTime, expDate : DateTime, c : Currency, rateCache : PolicyPeriodFXRateCache, __state : Jurisdiction,
            __subline : GLCostSubline, __splitType : GLCostSplitType) {
    super(effDate, expDate, c, rateCache)
    _state = __state
    _subline = __subline
    _splitType = __splitType
  }

  construct(cost : T) {
    super(cost)
    _state = cost.State
    _subline = cost.Subline
    _splitType = cost.SplitType
  }

  construct(cost : T, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
    _state = cost.State
    _subline = cost.Subline
    _splitType = cost.SplitType
  }

  override function setSpecificFieldsOnCost(line : GeneralLiabilityLine, costEntity: T) : void {
    costEntity.Subline = Subline
    costEntity.SplitType = SplitType
    costEntity.setFieldValue("GeneralLiabilityLine", line.FixedId)
  }

  override final protected property get KeyValues() : List<Object> {
    var result : List<Object> = {Subline, SplitType}
    result.addAll(GLKeyValues)
    return result
  }

  abstract property get GLKeyValues() : List<Object>

}
