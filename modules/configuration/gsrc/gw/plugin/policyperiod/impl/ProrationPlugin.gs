package gw.plugin.policyperiod.impl

uses gw.pl.currency.MonetaryAmount
uses gw.api.system.PLConfigParameters
uses gw.financials.Prorater
uses gw.pl.currency.MonetaryAmount
uses gw.plugin.policyperiod.IProrationPlugin

uses java.lang.IllegalArgumentException
uses java.math.BigDecimal
uses java.math.RoundingMode
uses java.util.Date
uses java.util.Map

@Export
class ProrationPlugin implements IProrationPlugin {

  protected var _params : Map<Object, Object>

  protected static final var IGNORE_LEAP_DAYS : String = "IgnoreLeapDays"
 
  /**
   * Get a Prorater to be used for financial calculation.   Code which needs to
   * calculate an amount of money that is applicable to a period of time (the
   * Transaction calculator, for example, and Rating engines) are required to
   * use a Prorater rather than doing direct calculation.
   *
   * roundingLevel and roundingMode are used as arguments to BigDecimal#setScale()
   *
   * @param roundingLevel the rounding level (fractional digits) to be applied to results
   * @param roundingMode the rounding mode to be used when rounding the result
   * @return A prorater instance
   */
  override function getProraterForRounding(roundingLevel : int, roundingMode : RoundingMode, prorationMethod : ProrationMethod) : Prorater {
    if (roundingLevel == null) throw new IllegalArgumentException("roundingLevel may not be null")
    if (roundingMode == null) throw new IllegalArgumentException("roundingMode may not be null")
    if (prorationMethod == null) throw new IllegalArgumentException("prorationMethod may not be null")

    return new ForGivenRoundingLevel ( 
      roundingLevel, roundingMode, prorationMethod,
      _params.containsKey(IGNORE_LEAP_DAYS) ?  _params.get(IGNORE_LEAP_DAYS) as boolean : PLConfigParameters.IgnoreLeapDays.Value
    )
  }

  override function setParameters(params : Map<Object, Object>) {
    _params = params
  }

  static class ForGivenRoundingLevel extends Prorater {

    var _ignoreLeapDays : boolean

    override function toString() : String { return "Prorater from PCRatingPlugin" }

    construct(level : int, mode : RoundingMode, method : ProrationMethod, ignoreLeapDays : boolean) {
      super(level, mode)
      if (method != TC_PRORATABYDAYS and method != TC_FLAT) {
        throw new IllegalArgumentException("Default prorater does not support proration method " +method)
      }
      _ignoreLeapDays = ignoreLeapDays
    }

    override function financialDaysBetween(startDate : Date, endDate : Date) : int {
      var days = startDate.daysBetween(endDate)
      if ( _ignoreLeapDays ){
        days -= new gw.util.DateRange(startDate, endDate).LeapDaysInInterval
      }
      return days
    }

    override function findEndOfRatedTerm(startDate : Date, daysInTerm : int) : Date {
      var interval = new gw.util.DateRange(startDate, startDate.addDays(daysInTerm))
      if( _ignoreLeapDays ){
        interval.end = interval.end.addDays( interval.LeapDaysInInterval )
      }
      return interval.end
    }

    override protected function prorateFromStart(periodStart : Date, periodEnd : Date,
                                       prorateTo : Date, amount : BigDecimal) : BigDecimal {
      var totalDays = financialDaysBetween(periodStart, periodEnd)
      if (totalDays == 0) {
        // prevent divide-by-zero.   prorateTo should always be within the
        // period, so this should really be 0/0.   But the only reasonable
        // proration value for a zero-length period is 0.
        return 0bd
      }
      var daysToProrate = financialDaysBetween(periodStart, prorateTo)
      // do the divide step last; there is a funny behavior in BigDecimal, such that 
      // (3*3)/9 == 1 but 3*(3/9) is 0.99999999.   Depending on the desired rounding level
      // and mode, this error can propagate.
      return scaleAmount(  (amount*daysToProrate) / totalDays )
    }

    override function scaleAmount(amount : BigDecimal) : BigDecimal {
      return amount.setScale(RoundingLevel, RoundingMode)
    }

    override function scaleAmount(amount : MonetaryAmount) : MonetaryAmount {
      return amount.setScale(RoundingLevel, RoundingMode)
    }
  }
}