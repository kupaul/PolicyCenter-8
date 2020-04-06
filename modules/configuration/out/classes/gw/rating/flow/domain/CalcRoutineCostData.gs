package gw.rating.flow.domain

uses typekey.CalcRoutineParamName
uses java.lang.String
uses gw.rating.CostData
uses java.math.BigDecimal
uses gw.plugin.rateflow.ICostDataWrapper
uses java.math.RoundingMode
uses java.lang.Integer
uses gw.plugin.Plugins
uses gw.plugin.rateflow.IRateRoutinePlugin
uses gw.rating.flow.util.RatingEntityGraphTraverser
uses gw.rating.flow.util.InScopeUsage
uses gw.api.rating.flow.VisibleInRateflow
uses gw.api.rating.flow.ValidateSetByRateflow

@Export
class CalcRoutineCostData implements ICostDataWrapper {

  protected var _costData : CostData
  protected var _defaultRoundingMode : RoundingMode
  protected var _defaultRoundingLevel : Integer

  construct(costData : CostData, defaultRoundingLevel : Integer, defaultRoundingMode : RoundingMode) {
    _costData = costData
    _defaultRoundingMode = defaultRoundingMode
    _defaultRoundingLevel = defaultRoundingLevel
  }

  property get ProrationMethod()  : ProrationMethod {
    return _costData.ProrationMethod
  }

  property set ProrationMethod(method : ProrationMethod) {
    _costData.ProrationMethod = method
  }

  override property get BaseRate() : BigDecimal {
    return _costData.StandardBaseRate
  }

  @ValidateSetByRateflow
  override property set BaseRate(rate : BigDecimal) {
    _costData.StandardBaseRate = rate
  }

  // This is an example of how to alias and hide properties.
  // In this case AdjRate was replaced by AdjustedRate, and the old one was retained
  // for backward compatibility.    Another case might be to alias the standard property
  // names to localized names.   In this case you would put the @VisibleInRateflow(false)
  // annotation on the standard name, and allow your renamed property to show instead.
  @VisibleInRateflow(false)
  @Deprecated("In PC 7.0.4.  Use AdjustedRate instead")
  property get AdjRate() : BigDecimal {
    return AdjustedRate
  }

  @VisibleInRateflow(false)
  @Deprecated("In PC 7.0.4.  Use AdjustedRate instead")
  property set AdjRate(rate : BigDecimal) {
    AdjustedRate = rate
  }

  override property get AdjustedRate() : BigDecimal {
    return _costData.StandardAdjRate
  }

  @ValidateSetByRateflow
  override property set AdjustedRate(rate : BigDecimal) {
    _costData.StandardAdjRate = rate
  }

  override property get TermAmount() : BigDecimal {
    return _costData.StandardTermAmount
  }

  @ValidateSetByRateflow
  override property set TermAmount(value : BigDecimal) {
    _costData.StandardTermAmount = value.setScale(RoundingLevelToUse, RoundingModeToUse)
  }

  override property get Basis() : BigDecimal {
    return _costData.Basis
  }

  @ValidateSetByRateflow(false) // We do not require this to be set
  override property set Basis(value : BigDecimal) {
    _costData.Basis = value
  }

  @VisibleInRateflow(false)
  override function setRounding(level : Integer, mode : RoundingMode) {
    _costData.RoundingLevel = level
    _costData.RoundingMode = mode
  }

  @VisibleInRateflow(false)
  property get RoundingModeToUse() : RoundingMode {
    return _costData.RoundingMode ?: _defaultRoundingMode
  }

  @VisibleInRateflow(false)
  property get RoundingLevelToUse() : Integer {
    return _costData.RoundingLevel ?: _defaultRoundingLevel
  }
}
