package gw.job.audit

uses java.util.Date
uses java.util.ArrayList

@Export
class AuditDateCalculator {
  
  private var _monthsPerPeriod : int
  private var _minPeriodLength : int
  private var _excludeLastDate : boolean
  private var _computeBaseDate(d : Date) : Date
  
  /**
   * Create a date calculator configured for calendar months.
   */
  static function forCalendarMonths(roundingDayOfMonth : int,
                                    frequency : AuditFrequency,
                                    minPeriodLength : int,
                                    excludeLastDate : boolean) : AuditDateCalculator {
    return new AuditDateCalculator(frequency, minPeriodLength, excludeLastDate,
                                   \d -> baseDateForCalendarMonths(d, roundingDayOfMonth)) 
  }
  
  /**
   * Create a date calculator configured to deal with policy months.
   */  
  static function forPolicyMonths(frequency : AuditFrequency,
                                  minPeriodLength : int,
                                  excludeLastDate : boolean) : AuditDateCalculator {
    return new AuditDateCalculator(frequency, minPeriodLength, excludeLastDate, \d -> d)
  }
  
  /**
   * Compute and return a list of dates from the given startDate to the given endDate, based on
   * whether the calculator is configured for calendar or policy months.
   */
  function computeDates(startDate : Date, endDate : Date) : List<Date> {
    var baseDate = _computeBaseDate(startDate)
    var dates = createPeriods(baseDate, endDate)
    dates.add(0, startDate)
    return dates
  }

  //
  // PRIVATE SUPPORT FUNCTIONS
  //  
  /**
   * Return the number of months per period based on the given frequency.  Currently limited to 
   * monthly and quarterly, but could be extended in the future.
   */
  private static function determineMonthsPerPeriod(frequency : AuditFrequency) : int {
    switch (frequency) {
      case "Monthly" :
        return 1
      case "Quarterly" :
        return 3
    }
    throw "Programming Error"
  }
  
  /**
   * If the day of month of the given startDate is beyond the roundingDayOfMonth, round up to the 
   * first day of the following month, otherwise do nothing.  Return the resulting date.
   */
  private static function baseDateForCalendarMonths(startDate : Date, roundingDayOfMonth : int) : Date {
    // Create a clone of the original date
    var baseDate = startDate.FirstDayOfMonth
    if (startDate.DayOfMonth >= roundingDayOfMonth) {
      baseDate = baseDate.addMonths(1)
    }
    return baseDate
  }

  /**
   * Create a list of dates[0..n], where for each i < n, date[i] represents the start of period[i]
   * and date[i+1] represents both the end of period[i] and the start of period[i+1].  Thus, the list will
   * contain n+1 dates representing n periods.  The algorithm does the following:
   * 1. Build an initial list with all the required dates.
   * 2. If the last pair of dates represents a period that is shorter than the minimum period length,
   *    remove the 2nd last date.
   * 3. If the last period is supposed to be removed, delete the last date.
   * 
   * Return the resulting list of dates
   */
  private function createPeriods(baseDate : Date, endDate : Date) : List<Date> {
    var dates : List<Date> = new ArrayList<Date>()
    var mpp = _monthsPerPeriod
    while (true) {
      var date : Date = baseDate.addMonths(mpp)
      if (date >= endDate) {
        break
      }
      if (date.DayOfMonth < baseDate.DayOfMonth) {
        date = date.addDays(1)
      }
      dates.add(date)
      mpp += _monthsPerPeriod
    }
    dates.add(endDate)
    
    //Adjust for minimum period
    var nDates = dates.Count
    if (nDates > 2 && dates[nDates-2].daysBetween(dates[nDates-1]) < _minPeriodLength) {
      dates.remove(nDates-2)
    }
    if (_excludeLastDate) {
      dates.remove(dates.last())
    }
    return dates
  }
  
  /**
   * Private constructor
   */
  private construct(frequency : AuditFrequency, minPeriodLength : int, excludeLastDate : boolean, computeBaseDate(d : Date) : Date) {
    _monthsPerPeriod = determineMonthsPerPeriod(frequency)
    _minPeriodLength = minPeriodLength
    _excludeLastDate = excludeLastDate
    _computeBaseDate = computeBaseDate
  }
}
