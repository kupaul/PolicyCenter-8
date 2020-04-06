package gw.rating

/**
 * An enumeration constant which describes whether a Cost has an override set, and if so at
 * what stage of the calculation.   The stages, in order, are:
 * <ol>
 * <li>OVERRIDE_NONE</li>
 * <li>OVERRIDE_BASERATE</li>
 * <li>OVERRIDE_ADJRATE</li>
 * <li>OVERRIDE_TERMAMOUNT</li>
 * <li>OVERRIDE_AMOUNT</li>
 * </ol>
 */
@Export
enum OverrideLevel {
  // IMPORTANT: order is significant here
  OVERRIDE_NONE, OVERRIDE_BASERATE, OVERRIDE_ADJRATE, OVERRIDE_TERMAMOUNT, OVERRIDE_AMOUNT
  
  /**
   * @return true if this value is greater than OVERRIDE_NONE
   */
  property get isOverridden() : boolean {
    return this > OVERRIDE_NONE
  }
  
  /**
   * Examine a Cost and determine at what level it was overridden.   Passing null, or a cost
   * whose Overridable property is false, will yield a result of OVERRIDE_NONE.
   * 
   * @param c The Cost whose override level is desired
   * @return The enum constant corresponding to the level at which the cost was overrridden.
   */
  @Deprecated("Normally you should set the OverrideLevel from CostData, not Cost")
  static function getLevelFromCost(c : Cost) : OverrideLevel {
    if (c == null or not c.Overridable) {
      return OVERRIDE_NONE
    } else if (c.OverrideAmount != null) {
      return OVERRIDE_AMOUNT 
    } else if (c.OverrideTermAmount != null) {
      return OVERRIDE_TERMAMOUNT 
    } else if (c.OverrideAdjRate != null) {
      return OVERRIDE_ADJRATE
    } else if (c.OverrideBaseRate != null) {
      return OVERRIDE_BASERATE
    } else {
      return OVERRIDE_NONE 
    }
  }

  /**
   * Examine a CostData and determine at what level it was overridden.   Passing null, or a cost
   * whose Overridable property is false, will yield a result of OVERRIDE_NONE.
   *
   * @param c The CostData whose override level is desired
   * @return The enum constant corresponding to the level at which the cost was overrridden.
   */
  static function getLevelFromCostData(c : CostData) : OverrideLevel {
    if (c == null or not c.Overridable) {
      return OVERRIDE_NONE
    } else if (c.OverrideAmount != null) {
      return OVERRIDE_AMOUNT 
    } else if (c.OverrideTermAmount != null) {
      return OVERRIDE_TERMAMOUNT 
    } else if (c.OverrideAdjRate != null) {
      return OVERRIDE_ADJRATE
    } else if (c.OverrideBaseRate != null) {
      return OVERRIDE_BASERATE
    } else {
      return OVERRIDE_NONE 
    }
  }
}
