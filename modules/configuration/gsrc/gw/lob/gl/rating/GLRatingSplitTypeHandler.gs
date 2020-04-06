package gw.lob.gl.rating
uses java.math.BigDecimal
uses java.util.Date
uses java.lang.Math
uses java.math.RoundingMode
uses java.lang.Double
uses gw.api.database.Query

@Export
abstract class GLRatingSplitTypeHandler {
  
  //public for purposes of testing
  public static var PD_MIN_RATE : double = 0.1000
  public static var PD_MAX_RATE : double = 0.3000
  public static var BI_MIN_RATE : double = 0.7500
  public static var BI_MAX_RATE : double = 0.9500
  public static var PRODUCTS_ADJUSTMENT : double = 0.6667

  private var _splitType : GLCostSplitType as readonly SplitType
  private var _minRate : double
  private var _maxRate : double

  construct(mySplitType : GLCostSplitType, minRate : double, maxRate : double) {
    _splitType = mySplitType
    _minRate = minRate
    _maxRate = maxRate
  }

  abstract function calcIncreasedLimitsFactor(wrapper : gw.lob.gl.rating.GLSysTableRatingEngine.GLCovWrapper) : BigDecimal   

  function computeACompletelyBogusButLegalRate(classCode : String, subline : String) : BigDecimal {
    var tweakForProducts = (subline == "Products") ? PRODUCTS_ADJUSTMENT : 1.00
    return computeACompletelyBogusButLegalRateBasedOnAHashCode(classCode.hashCode(), tweakForProducts * _minRate, tweakForProducts * _maxRate)
  }

  function getRateFor(classCode : String, state : Jurisdiction, subline : GLCostSubline, date : Date) : BigDecimal {
    var candidateRates = findCandidateRates(classCode, subline, state, date)
    return selectRateFromCandidates(classCode, candidateRates, subline as String)
  }

  protected function selectRateFromCandidates(classCode : String, possibleRates : List<RateGLClassCodeExt>, sublineForBogosity : String) : BigDecimal {
    var selectedRate = selectFromCandidateRatesForSplitType(possibleRates)
    if (selectedRate != null) {
      return selectedRate.rate
    }
    return computeACompletelyBogusButLegalRate(classCode, sublineForBogosity)
  }

  function selectFromCandidateRatesForSplitType(possibleRates : List<RateGLClassCodeExt>) : RateGLClassCodeExt {
    var possibleRatesForThisSplitType = possibleRates.where( \ r -> r.splitType == SplitType.Code)
    var stateSpecificResult = possibleRatesForThisSplitType.firstWhere( \r -> r.rateState != null)
    var stateNonspecificResult = possibleRatesForThisSplitType.first()
    switch (true) {
      case stateSpecificResult != null: return stateSpecificResult
      case stateNonspecificResult != null: return stateNonspecificResult
      default: return null
    }
  }

  private function findCandidateRates(classCode : String, subline : GLCostSubline, state : Jurisdiction, date : Date) : List<RateGLClassCodeExt> {
    var query = Query.make(RateGLClassCodeExt)
    query.compare(RateGLClassCodeExt#ClassCode.PropertyInfo.Name, Equals, classCode)
          .compare(RateGLClassCodeExt#Subline.PropertyInfo.Name, Equals, subline.Code)    
          .and(\ andRestriction -> andRestriction
            .or(\ restriction -> {
              var rateStateColumnName = RateGLClassCodeExt#RateState.PropertyInfo.Name
              restriction.compare(rateStateColumnName, Equals, null)
              restriction.compare(rateStateColumnName, Equals, state.Code)
            })
            .or(\ restriction -> {
              var effDateColumnName = RateGLClassCodeExt#EffDate.PropertyInfo.Name
              restriction.compare(effDateColumnName, Equals, null)
              restriction.compare(effDateColumnName, LessThanOrEquals, date)  
            })
            .or(\ restriction -> {
              var expDateColumnName = RateGLClassCodeExt#ExpDate.PropertyInfo.Name
              restriction.compare(expDateColumnName, Equals, null)
              restriction.compare(expDateColumnName, GreaterThan, date)  
            })
          )          
    return query.select().toList()
  }

  private static function computeACompletelyBogusButLegalRateBasedOnAHashCode(hash : int, lo : double, hi : double) : BigDecimal {
    var f = Math.abs(hash % 1000) / 1000.0
    var valueAsDouble = lo + f * (hi - lo)
    return BigDecimal.valueOf(valueAsDouble).setScale(4, RoundingMode.HALF_UP)
  }
  
  /**
   * Handler for PD (Property Damage)
   * Implemented as singleton anonymous class.
   */
  public static final var PD_SPLIT_TYPE_HANDLER : GLRatingSplitTypeHandler = new GLRatingSplitTypeHandler("PD", PD_MIN_RATE, PD_MAX_RATE) { 
    override function calcIncreasedLimitsFactor( wrapper: gw.lob.gl.rating.GLSysTableRatingEngine.GLCovWrapper ) : BigDecimal {
      return wrapper.PDIncreasedLimitFactor
    }
  }
  
  /**
   * Handler for BI (Bodily Injury)
   * Implemented as singleton anonymous class.
   */
  public static final var BI_SPLIT_TYPE_HANDLER : GLRatingSplitTypeHandler = new GLRatingSplitTypeHandler("BI", BI_MIN_RATE, BI_MAX_RATE) { 
    override function calcIncreasedLimitsFactor( wrapper: gw.lob.gl.rating.GLSysTableRatingEngine.GLCovWrapper ) : BigDecimal {
      return wrapper.BIIncreasedLimitFactor
    }
  }

  /**
   * Handler for CSL (Combined Split Limit)
   * Implemented as singleton anonymous class.
   */
  public static final var CSL_SPLIT_TYPE_HANDLER : GLRatingSplitTypeHandler = new GLRatingSplitTypeHandler("CSL", Double.NaN_, Double.NaN_) { 
    override function calcIncreasedLimitsFactor( wrapper: gw.lob.gl.rating.GLSysTableRatingEngine.GLCovWrapper ) : BigDecimal {
      return wrapper.CSLIncreasedLimitFactor
    }

    override function selectRateFromCandidates(classCode : String, possibleRates : List<RateGLClassCodeExt>, sublineForBogosity : String) : BigDecimal {
      var selectedRate = selectFromCandidateRatesForSplitType(possibleRates)
      if (selectedRate != null) {
        return selectedRate.rate
      }
      return PD_SPLIT_TYPE_HANDLER.selectRateFromCandidates(classCode, possibleRates, sublineForBogosity)
          +  BI_SPLIT_TYPE_HANDLER.selectRateFromCandidates(classCode, possibleRates, sublineForBogosity)
    }

    override function computeACompletelyBogusButLegalRate(classCode : String, subline : String) : BigDecimal {
      throw "Should never be called"
    }
  }
}
