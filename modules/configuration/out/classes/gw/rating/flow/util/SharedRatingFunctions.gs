package gw.rating.flow.util
uses gw.rating.flow.RatingFunctionSource
uses java.math.BigDecimal
uses gw.financials.Prorater
uses java.util.Date
uses java.lang.IllegalArgumentException
uses gw.rating.worksheet.WorksheetLogger

/**
 * Methods on an instance of this class will be available to all rateflow routines via the Functions menu.
 *
 * <strong>No state information should be stored on this class, and all methods must be re-entrant.</strong>
 * The class instance will be created by the system automatically, and may be shared.
 */
@Export
class SharedRatingFunctions extends RatingFunctionSource {
  // this function should stay protected, NOT public!
  override protected function availableForLine(policyLineCode : String) : boolean {
    return true // available to all lines
  }

  /**
   * @return today's date.
   */
  function currentDate() : Date {
    return Date.Today
  }

  /**
   * Compute the number of days between startDate and endDate.
   * @param startDate The first day of the date range
   * @param endDate The last day of the date range
   * @return number of calendar days in the range
   */
  function calendarDaysBetweenDates(startDate : java.util.Date, endDate : java.util.Date) : int {
    return startDate.daysBetween(endDate)
  }

  /**
   * Compute the number of days between startDate and endDate, according to the proration calendar.
   * A common adjustment between calendar days and financial days is to ignore February 29 (treat all years as 365 days).
   *
   * @param startDate The first day of the date range
   * @param endDate The last day of the date range
   * @return number of days in the range, according to financial prorater
   */
  function financialDaysBetweenDates(startDate : java.util.Date, endDate : java.util.Date) : int {
    var p = Prorater.forFinancialDays(TC_PRORATABYDAYS)
    return p.financialDaysBetween(startDate, endDate)
  }

  /**
   * @param aDate date for which the year component is desired
   * @return the year represented by the given date
   */
  function year(aDate : java.util.Date) : int {
    return aDate.YearOfDate
  }

  /**
   * @param aDate date for which the month component is desired
   * @return the month represented by the given date (1 = January)
   */
  function month(aDate : java.util.Date) : int {
    return aDate.MonthOfYear
  }

  /**
   * @param num A decimal number
   * @return absolute value of the given number
   */
  function abs(num : BigDecimal) : BigDecimal {
    return num.abs()
  }

  /**
   * @param num a decimal number
   * @return square of the given number
   */
  function square(num : BigDecimal) : BigDecimal {
    return num*num
  }

  /**
   * @param num a decimal number
   * @return cube of the given number
   */
  function cube(num : BigDecimal) : BigDecimal {
    return num*num*num
  }

  /**
   * @param num1 A decimal number
   * @param num2 A decimal number
   * @return the lesser of num1 and num2
   */
  function min(num1: BigDecimal, num2 : BigDecimal) : BigDecimal {
    return num1.min(num2)
  }

  /**
   * @param num1 A decimal number
   * @param num2 A decimal number
   * @param num3 A decimal number
   * @return the least of num1, num2, and num3
   */
  function min3(num1: BigDecimal, num2 : BigDecimal, num3 : BigDecimal) : BigDecimal {
    return num1.min(num2.min(num3))
  }

  /**
   * @param num1 A decimal number
   * @param num2 A decimal number
   * @return the greater of num1 and num2
   */
  function max(num1: BigDecimal, num2 : BigDecimal) : BigDecimal {
    return num1.max(num2)
  }

  /**
   * @param num1 A decimal number
   * @param num2 A decimal number
   * @param num3 A decimal number
   * @return the greatest of num1, num2 and num3
   */
  function max3(num1: BigDecimal, num2 : BigDecimal, num3 : BigDecimal) : BigDecimal {
    return num1.max(num2.max(num3))
  }

  /**
   * Cap premium to the range (priorValue - allowedChangeAmount, priorValue + allowedChangeAmount).
   * If value is within that range, return value.  If value is outside that range, return the nearer
   * limit (i.e. if the value is below the range, return the bottom of the range, and if it is above
   * the range return the top.)
   *
   * @param value The new premium amount
   * @param priorValue The prior term amount for this same premium
   * @allowedChangeAmount The maximum allowable change, in the same currency as the amounts.
   * @return value, capped to be no more than allowedChangeAmount away from priorValue
   * @throws IllegalArgumentException if allowedChangeAmount < 0
   */
  function capPremiumByAmount(value : BigDecimal, priorValue : BigDecimal, allowedChangeAmount : BigDecimal) : BigDecimal {
    if (allowedChangeAmount < 0) {
      throw new IllegalArgumentException("Cap amount cannot be negative")
    }

    var log = WorksheetLogger.get()

    // var upperBound = priorValue + allowedChangeAmount
    var upperBound = log.let("upperBound",  \ -> log.Term.vr("priorValue", priorValue) + log.Addition.vr("allowedChangeAmount", allowedChangeAmount) )

    // var lowerBound = priorValue - allowedChangeAmount
    var lowerBound = log.let("lowerBound", \ -> log.Term.vr("priorValue", priorValue) - log.Subtraction.vr("allowedChangeAmount", allowedChangeAmount) )

    // var capped = value.min(upperBound)
    var capped = log.let("capped", \ -> log.Term.fn("value", value, "min", \ -> value.min(log.arg("value", \ ->log.Term.vr("upperBound", upperBound)))))

    // capped = capped.max(lowerBound)
    capped = log.store("capped", \ -> log.Term.fn("capped", capped, "max", \ -> capped.max(log.arg("value", \ -> log.Term.vr("lowerBound", lowerBound)))))

    // return capped
    return log.retrn(\ -> log.Term.vr("capped", capped))

  }

  /**
   * Cap premium to the range (priorValue*(1 - allowedChangePercent/100), priorValue*(1 + allowedChangePercent/100)).
   * If value is within that range, return value.  If value is outside that range, return the nearer
   * limit (i.e. if the value is below the range, return the bottom of the range, and if it is above
   * the range return the top.)
   *
   * @param value The new premium amount
   * @param priorValue The prior term amount for this same premium
   * @allowedChangeAmount The maximum allowable change, as a percentage of priorAmount.
   * @return value, capped to be no more than allowedChangeAmount away from priorValue
   * @throws IllegalArgumentException if allowedChangePercent < 0
   */
  function capPremiumByPercent(value : BigDecimal, priorValue : BigDecimal, allowedChangePercent : BigDecimal) : BigDecimal {
    if (allowedChangePercent < 0) {
      throw new IllegalArgumentException("Cap percentage cannot be negative")
    }

    var log = WorksheetLogger.get()

    // var allowedChangeAmount = (priorValue * allowedChangePercent)/100.0
    var allowedChangeAmount = log.let("allowedChangeAmount",
      \ -> ( log.Term.vr("priorValue", priorValue, 1, 0) * log.Multiplication.vr("allowedChangePercent", allowedChangePercent, 0, 1)) / log.Division.co(100.0))

    // return capPremiumAmount(value, priorValue, allowedChangeAmount)
    return log.retrn(
      \ -> log.Term.fn(SharedRatingFunctions, "capPremiumAmount",
        \ -> capPremiumByAmount(
               log.arg("value", value),
               log.arg("priorValue", priorValue),
               log.arg("allowedChangeAmount", allowedChangeAmount)
             )
           )
    )

  }

  /**
   * @param x variable for polynomial
   * @param a x<sup>2</sup> coefficient for polynomial
   * @param b x<sup>1</sup> coefficient for polynomial
   * @param c constant term for polynomial
   * @return a*x<sup>2</sup> + b*x + c
   */
  function polynomial2(x : BigDecimal, a: BigDecimal, b : BigDecimal, c : BigDecimal) : BigDecimal {
    return a*x.pow(2) + b*x + c
  }

  /**
   * @param x variable for polynomial
   * @param a x<sup>3</sup> coefficient for polynomial
   * @param b x<sup>2</sup> coefficient for polynomial
   * @param c x<sup>1</sup> coefficient for polynomial
   * @param d constant term for polynomial
   * @return a*x<sup>3</sup> + b*x<sup>2</sup> + c*x + d
   */
  function polynomial3(x : BigDecimal, a : BigDecimal, b : BigDecimal, c : BigDecimal, d : BigDecimal) : BigDecimal {
    return a*x.pow(3) + b*x.pow(2) + c*x + d
  }
}
