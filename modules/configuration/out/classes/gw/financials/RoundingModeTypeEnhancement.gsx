
package gw.financials

/**
 * Conversion methods for converting a {@link CalcStepOperatorType} to a {@link RoundingModeType}.
 */
enhancement RoundingModeTypeEnhancement : typekey.RoundingModeType {

  /**
   * Returns the {@link RoundingMode} for this {@link RoundingModeType}
  */
  property get ModeValue() : java.math.RoundingMode {
    return java.math.RoundingMode.valueOf(this.Code)
  }

  /**
   * Converts a {@link CalcStepOperatorType} to a {@link RoundingModeType}, or null if the operator doesn't match any rounding mode type.
   */
  static function getRoundingModeTypeForCalcStepOpType(opType: CalcStepOperatorType) : typekey.RoundingModeType {
    switch (opType) {
      // rounding category
      case TC_HALFUP:
        return RoundingModeType.TC_HALF_UP
      case TC_UP:
        return RoundingModeType.TC_UP
      case TC_DOWN:
        return RoundingModeType.TC_DOWN
      case TC_HALFEVEN:
        return RoundingModeType.TC_HALF_EVEN

      // optrounding category
      case TC_HALFDOWN:
        return RoundingModeType.TC_HALF_DOWN
      case TC_CEILING:
        return RoundingModeType.TC_CEILING
      case TC_FLOOR:
        return RoundingModeType.TC_FLOOR
      case TC_UNNECESSARY:
        return RoundingModeType.TC_UNNECESSARY

      default: // non-rounding operator
        return null
    }
  }
}
