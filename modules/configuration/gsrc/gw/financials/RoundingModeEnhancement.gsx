package gw.financials

enhancement RoundingModeEnhancement : java.math.RoundingMode {
  property get TypeKey() : RoundingModeType {
    return this.toString() as RoundingModeType
  }
}
