package gw.rating.flow
uses java.lang.Integer

enhancement RoundingScaleTypeEnhancement : typekey.RoundingScaleType {
  
  property get ScaleValue() : Integer {
    switch (this) {
      case TC_4:
        return 4
      case TC_3:
        return 3
      case TC_2:
        return 2
      case TC_1:
        return 1
      case TC_0:
        return 0
      case TC_MINUS1:
        return -1
      case TC_MINUS2:
        return -2
      case TC_MINUS3:
        return -3
      default:
        return null
    }
  }
  
}
