package gw.policy

uses java.math.BigDecimal

enhancement ModifierEnhancement : entity.Modifier
{
  /**
   * @return the sum of all rate factors on this modifier
   */
  property  get RateFactorsSum() : BigDecimal {
    var val : double
    val = 0
    for (rateFactor in this.RateFactors) {
      if (rateFactor.Assessment != null) {
        val = val + rateFactor.Assessment.doubleValue()
      }
    }
    return val
  }
  
  /**
   * The validation expression to validate the given value. Returns null if the given
   * value is in the range allowed for this modifier; Otherwise, an error message is returned.
   */
  function getModifierValidation(target : String) : String {
    var targetAsBD = target as BigDecimal
    var withinRange = this.Minimum <= targetAsBD and targetAsBD <= this.Maximum
    return withinRange ? null : displaykey.Web.Policy.Modifiers.OutOfRange(targetAsBD, this.Minimum, this.Maximum )
  }
}
