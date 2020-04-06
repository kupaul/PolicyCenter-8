package gw.api.ui

enhancement BigDecimalUIEnhancement : java.math.BigDecimal {
  function asString() : String{
    return this == 0 ? "" : this as String
  }
}
