package gw.rating.flow.domain
uses java.math.BigDecimal
uses gw.plugin.rateflow.ICostDataWrapper
uses gw.rating.CostDataWithOverrideSupport
uses java.math.RoundingMode
uses java.lang.Integer
uses gw.api.rating.flow.VisibleInRateflow
uses gw.api.rating.flow.ValidateSetByRateflow

@Export
class CalcRoutineCostDataWithAmountOverride implements ICostDataWrapper { 
  enum OverrideMode {
    APPROXIMATE_STANDARD_RATES,  // for one-pass rating   
    IGNORE_OVERRIDES,            // for two-pass rating, first pass
    USE_EXISTING_STANDARD_RATES  // for two-pass rating, second pass
  }

  protected var _costData : CostDataWithOverrideSupport
  protected var _defaultRoundingMode : RoundingMode
  protected var _defaultRoundingLevel : Integer

  protected var _actualBaseRate   : BigDecimal
  protected var _actualAdjRate    : BigDecimal
  protected var _actualTermAmount : BigDecimal
  protected var _actualAmount     : BigDecimal

  protected var _explicitAdjRate    : BigDecimal
  protected var _explicitTermAmount : BigDecimal
  protected var _explicitAmount     : BigDecimal
  
  protected var _mode : OverrideMode
  
  /**
   * Create an ICostDataWrapper wrapper which wraps a subclass of CostDataWithOverrideSupport.
   * If mode == IGNORE_OVERRIDES, the wrapper will simply set and get Standard rates/amounts,
   * just as if the costData did not have override support.   Otherwise, the override handling
   * methods will be called.
   * The other two modes control whether to initialize the explicit rate fields before rating.
   * If mode == APPROXIMATE_STANDARD_RATES, these will be left null and the CostData will 
   * compute approximations.
   * If mode == USE_EXISTING_STANDARD_RATES, the three "explicit" fields in this wrapper
   * will be initialized with copies of the Standard values that are in the costData.
   * 
   * If you are rating a coverage for which approximation applies, you should simply
   * rate once, with mode == APPROXIMATE_STANDARD_RATES.   If your coverage demands
   * that you calculate the standard rates explicitly, then rate twice, first
   * using IGNORE_OVERRIDES, and then a second time, <em>passing the same CostData
   * instance</em> and using USE_EXISTING_STANDARD_RATES.   The result will be that
   * the first run through rating will set Standard amounts, and the second run
   * will process overrides, but provide the Standard amounts from the first run.
   */
  construct(costData : CostDataWithOverrideSupport, mode : OverrideMode, defaultRoundingLevel : Integer, defaultRoundingMode : RoundingMode) {
    _costData = costData
    _mode = (_costData.Overridable) ? mode : IGNORE_OVERRIDES
    _defaultRoundingMode = defaultRoundingMode
    _defaultRoundingLevel = defaultRoundingLevel
    if (mode == USE_EXISTING_STANDARD_RATES) {
      _explicitAdjRate = costData.StandardAdjRate
      _explicitTermAmount = costData.StandardTermAmount
      _explicitAmount = costData.StandardAmount
    } else {
      // null values here will cause setXxxAndHandleOverrides to calculate approximate standard values.
      _explicitAdjRate = null
      _explicitTermAmount = null
      _explicitAmount = null
    }
  }

  property get ProrationMethod()  : ProrationMethod {
    return _costData.ProrationMethod
  }

  property set ProrationMethod(method : ProrationMethod) {
    _costData.ProrationMethod = method
  }

  override property get BaseRate() : BigDecimal {
    if (_mode == IGNORE_OVERRIDES) {
      return _costData.StandardBaseRate
    } else {
      return _actualBaseRate
    }
  }
  
  @ValidateSetByRateflow
  override property set BaseRate(rate : BigDecimal) {
    if (_mode == IGNORE_OVERRIDES) {
      _costData.StandardBaseRate = rate
    } else {
      if (_actualBaseRate != null) {
        throw displaykey.Web.Rating.Errors.CanNotWriteBase
      }
      _actualBaseRate = _costData.setBaseRateAndHandleOverrides(rate)
    }
  }

  override property get AdjustedRate() : BigDecimal {
   if (_mode == IGNORE_OVERRIDES) {
      return _costData.StandardAdjRate
    } else {
      return _actualAdjRate
    }
  }
  
  @ValidateSetByRateflow
  override property set AdjustedRate(rate : BigDecimal) {
    if (_mode == IGNORE_OVERRIDES) {
      _costData.StandardAdjRate = rate
    } else {
      if (_actualAdjRate != null) {
        throw displaykey.Web.Rating.Errors.CanNotWriteAdjRate
      }
      _actualAdjRate = _costData.setAdjRateAndHandleOverrides(rate, _explicitAdjRate)
    }
  }

  @VisibleInRateflow(false)
  @Deprecated("In PC 7.0.4.  Use AdjustedRate")
  property get AdjRate() : BigDecimal {
   return AdjustedRate
  }
  
  @VisibleInRateflow(false)
  @Deprecated("In PC 7.0.4.  Use AdjustedRate")
  property set AdjRate(rate : BigDecimal) {
    AdjustedRate = rate
  }
  
  override property get TermAmount() : BigDecimal {
   if (_mode == IGNORE_OVERRIDES) {
      return _costData.StandardTermAmount
    } else {
      return _actualTermAmount
    }
  }
  
  @ValidateSetByRateflow
  override property set TermAmount(value : BigDecimal) {
    if (_mode == IGNORE_OVERRIDES) {
      _costData.StandardTermAmount = value.setScale(RoundingLevelToUse, RoundingModeToUse)
    } else {
      if (_actualTermAmount != null) {
        throw displaykey.Web.Rating.Errors.CanNotWriteTermAmount
      }
      _actualTermAmount = _costData.setTermAmountAndHandleOverrides(value.setScale(RoundingLevelToUse, RoundingModeToUse), _explicitTermAmount)
    }
  }

  override property get Basis() : BigDecimal {
    return _costData.Basis
  }

  @ValidateSetByRateflow(false) // We do not require this to be set  
  override property set Basis(value : BigDecimal) {
    _costData.Basis = value
  }
  
  // If your Cost is BasisScalable, overriding amount might be sensible
  property get Amount() : BigDecimal{
   if (_mode == IGNORE_OVERRIDES) {
      return _costData.StandardAmount
    } else {
      return _actualAmount
    }
  }
  
  // If your Cost is BasisScalable, overriding amount might be sensible
  property set Amount(value : BigDecimal) {
    if (_mode == IGNORE_OVERRIDES) {
      _costData.StandardAmount = value
    } else {
      if (_actualAmount != null) {
        throw displaykey.Web.Rating.Errors.CanNotWriteAmountCostData
      }      
      _actualAmount = _costData.setAmountAndHandleOverrides(value.setScale(RoundingLevelToUse, RoundingModeToUse), _explicitAmount)
    }
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
