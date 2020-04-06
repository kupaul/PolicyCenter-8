package gw.rating.flow
uses java.math.BigDecimal
uses java.util.Date
uses gw.rating.rtm.util.ProductModelUtils

enhancement ModifiableRatingEnhancement : entity.Modifiable {
  
  /**
   * Get the boolean value for the modifier corresponding to the given code.  Returns null if not found.
   */
  function getBooleanModifierValue(modifierCode : String) : Boolean {
    return this.getModifier(modifierCode).BooleanModifier
  }
  
  /**
   * Get the decimal modifier value corresponding to the given code.   Returns 1.0 if modifier not found.
   */
  function getDecimalModifierValue(modifierCode : String) : BigDecimal {
    var m = this.getModifier(modifierCode)
    if (m.RateModifier == null) {
      var linePattern = ProductModelUtils.getPolicyLinePattern(this.ModifiableLine.PatternCode)
      var modifierPattern = linePattern.ModifierPatterns.singleWhere(\ mp -> mp.Code == modifierCode)
      // if modifier is a schedule rate, return 0, otherwise return 1
      return modifierPattern.ScheduleRate ? 0.0bd : getDefaultValueBasedOnRenderingFormat(modifierPattern)
    } else {
      return m.RateModifier
    }
  }
  
  /**
   * Get the typekey value for the modifier corresponding to the given code.  Returns null if not found.
   */
  function getTypekeyModifierValue(modifierCode : String) : String {
    return this.getModifier(modifierCode).TypeKeyModifier
  }
  
  /**
   * Get the date value for the modifier corresponding to the given code.  Returns null if not found.
   */
  function getDateModifierValue(modifierCode : String) : Date {
    return this.getModifier(modifierCode).DateModifier
  }
  
  function getDefaultValueBasedOnRenderingFormat( modifierPattern : gw.api.productmodel.ModifierPattern ): BigDecimal {
    //If the rendering format is unspecified, we maintain previous behavior
    if (modifierPattern != null and modifierPattern.RenderRateAsMultiplier != null
        and not modifierPattern.RenderRateAsMultiplier) {
      return 0.0bd
    }
    return 1.0bd
  }
  
}
