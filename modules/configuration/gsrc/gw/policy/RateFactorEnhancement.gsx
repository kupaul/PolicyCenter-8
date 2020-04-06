package gw.policy

uses java.math.BigDecimal

enhancement RateFactorEnhancement : entity.RateFactor
{
  /**
   * Returns true if the given target falls within the Minimum 
   * and Maximum values of the ratefactor
   */
  function isValueWithinRange( target : String  ) : boolean {
    var targetAsBD = new BigDecimal(target)
    return this.Minimum <= targetAsBD and targetAsBD <= this.Maximum
  }
}
