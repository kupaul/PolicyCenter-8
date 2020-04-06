package gw.rating.flow
uses java.math.BigDecimal

@Export
class CalcRoutineRoundingMethod {
  
  static function setScale(value : BigDecimal, scale : RoundingScaleType, roundingMode : RoundingModeType) : BigDecimal {
    return value.setScale(scale.ScaleValue, roundingMode.ModeValue)
  }
  
}
