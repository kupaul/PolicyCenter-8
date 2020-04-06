package gw.util;
uses java.util.Date;
uses java.lang.Integer
uses gw.api.util.DateUtil;
uses gw.api.util.StringUtil
uses gw.i18n.DateTimeFormat

enhancement GWBaseDateEnhancement : Date {
  
  static property get CurrentDate() : Date {
      return DateUtil.currentDate()
  }
  
  /**
   * @return The number of minutes elapsed since the time.
   */
  property get MinutesSince() : Integer {
      return DateUtil.minutesSince( this )
  }
        
  /**
   * @return The number of seconds elapsed since the time.
   */
  property get SecondsSince() : Integer {
    return DateUtil.secondsSince( this )
  }
  
  /**  
   * @return The number of hours elapsed since the time.
   */
  property get HoursSince() : Integer {
      return DateUtil.hoursSince(this)
  }
  /**
   * @return The number of days elapsed since the time.
   */
  property get DaysSince() : Integer {
      return DateUtil.daysSince(this)
  }
  /**
     * Returns number of days between two dates.
     *
     * @param other   The other date.
     * @return The number of days between the two dates. The number is the
     *         absolute value of the difference in days.
     */
  function daysBetween(other : Date) : int {
      return DateUtil.daysBetween(this, other)
  }

  /**
   * Returns the difference between dateEnd at midnight and this date at midnight, in days.
   *
   * @param dateEnd   The end date.
   * @return The difference between dateEnd and this date, in days. The result
   * is positive if this date comes before dateEnd (ignoring time); negative if this date comes 
   * after dateEnd (ignoring time); zero if the two dates are the same (ignoring time)
   */
  function differenceInDays(dateEnd : Date) : int {
      return DateUtil.differenceInDays(this, dateEnd)
  }

  /**
     * Compares only the date components of two dates, the time component is
     * ignored.
     *
     * @param targetDate The date to compare against.
     * @return The value 0 if date1 equals date; a value less than 0 if date1 is
     *         less than date2; and a value greater than 0 if date1 is greater than date2.
     */
  function compareIgnoreTime(targetDate : Date) : int {
      return DateUtil.compareIgnoreTime(this, targetDate)
  }

  /**
   * Trim the given date to midnight.  That is to say, set days, hours,
   * minutes, seconds, and millis to zero.
   * @return a Date without any time component.
   */
  function trimToMidnight() : Date {
    return DateUtil.trimToMidnight(this);
  }
  /**
   * Converts the date portion of this date into a string, using the given format.
   * 
   * @param dateComponent either a hard-coded date format, as described by java.text.SimpleDateFormat,
   * or the name of one of the localized date formats defined in gw.i18n.DateTimeFormat. When the name of a localized
   * date format is specified, then the date is formatted in the current locale.
   */
  function format(dateComponent : String) : String {
      return StringUtil.formatDate(this, dateComponent)
  }
  /**
     * Converts the date portion of this date into a string, using the "short" date format, in the current locale.
     * @deprecated Use formatDate(gw.i18n.DateTimeFormat) instead.
     */
  function formatToUIStyle() : String {
      return StringUtil.formatDate(this, "short")
  }

  /**
   * Converts this date into a string, using the given date and time formats, in the current locale.
   */
  function formatDateTime(dateComponent : DateTimeFormat, timeComponent : DateTimeFormat) : String {
    if( dateComponent == null )
    {
      return StringUtil.formatTime( this, timeComponent as String );
    }

    if( timeComponent == null )
    {
      return StringUtil.formatDate( this, dateComponent as String );
    }

    return StringUtil.formatDate( this, dateComponent as String) + " " +
           StringUtil.formatTime( this, timeComponent as String);
  }
  
  /**
   * Converts the date portion of this date into a string, using the given date format, in the current locale.
   */
  function formatDate(dateFormat : DateTimeFormat) : String {
    return formatDateTime(dateFormat, null)
  }
  
  /**
   * Converts the time portion of this date into a string, using the given time format, in the current locale.
   */
  function formatTime(timeFormat : DateTimeFormat) : String {
    return formatDateTime(null, timeFormat)
  }

  /**
     * The name of the month of the year.
     *
     * @return The name of the month of the year.
     */
  property get MonthName() : String {
      return getMonthName(DateUtil.getMonth(this))
  }
  /**
     * Get the year.
     *
     * @return The year of the date.
     */
  property get YearOfDate() : Integer {
      return DateUtil.getYear(this)
  }
  /**
     * Get the year from a string of digits.  Always returns a four-digit year.
     * Will convert a two-digit year into a four-digit year. Two digit years are
     * resolved using the TwoDigitYearThreshold configuration parameter.
     *
     * @param yearString String representation of a year, either two digits or four digits.
     * @return The four-digit representation of a year.  Returns null if the input String was invalid.
     */
  static function getYearFromString(yearString : String) : String {
      return DateUtil.getYearFromString(yearString)
  }
  /**
     * Get the day of week name.
     *
     * @return The name of the day in the week e.g., "Monday".
     */
  property get DayOfWeekName() : String {
      return DateUtil.getDayOfWeekName(this)
  }
  /**
     * Gets the name of the given month.
     *
     * @param month the 1-based month value. I.e., January is 1, February is 2, etc.
     */
  static function getMonthName(m : int) : String {
      return DateUtil.getMonthName(m)
  }
  /**
     * Return an array seven of booleans where each boolean indicates whether the corresponding day is considered
     * a business day.  The array is laid out like so:<p/>
     * <br/>
     *   <code>[Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday]</code>
     */
  static function getBusinessDaysAsBooleanArray(holidayZoneType : Object ) : boolean[] {
      return DateUtil.getBusinessDaysAsBooleanArray(holidayZoneType)
  }
  /**
     * Return the days configured to be holidays for the system.
     * @return An array of the dates configured to be holidays under the tag code HolidayTagCode.TC_GENERAL.
     */
  function getConfiguredHolidays() : Date[] {
      return DateUtil.getConfiguredHolidays()
  }
  /**
     * Return the days configured to be holidays under a certain holiday tag code.
     * @param tagCode The holiday tag code.
     * @return An array of the dates configured to be holidays under the given tag code.
     */
  function getConfiguredHolidays(tagCode : HolidayTagCode) : Date[] {
      return DateUtil.getConfiguredHolidays(tagCode)
  }
  /**
     * Return the days configured to be holidays for a certain location.
     * @param location The location.
     * @return An array of the dates configured to be holidays for the given location.
     */
  function getConfiguredHolidays(location : Zone) : Date[] {
      return DateUtil.getConfiguredHolidays(location)
  }
  /**
     * Adds the specified (signed) amount of business days to the given date.
     * The time of day of the given date is preserved in the result.
     *
     * @param iDays The number of business days added.
     * @return A new date with the business days added.
     */
  function addBusinessDays(iDays : int) : Date {
      return DateUtil.addBusinessDays(this, iDays)
  }
  /**
     * Adds the specified (signed) number of business days to the given date,
     * based on a holiday tag code which will determine which holiday schedule is consulted.
     * The time of day of the given date is preserved in the result.
     *
     * @param iDays The number of business days to add.
     * @param tagCode The holiday tag code.
     * @param businessWeekType Either a zone or an address indicating which businessWeek to fetch. If null is passed in, it will use the
     * default one.
     * @return A new date with the business days added.
     */
  function addBusinessDays(iDays : int, tagCode : HolidayTagCode, businessWeekType : Object) : Date {
    return DateUtil.addBusinessDays(this, iDays, tagCode, businessWeekType)
  }
  /**
     * Adds the specified (signed) number of business days to the given date,
     * based on a location which may determine which holiday schedule is consulted.
     * The time of day of the given date is preserved in the result.
     *
     * @param iDays The number of business days to add.
     * @param location The location.
     * @return A new date with the business days added.
     */
  function addBusinessDays(iDays : int, location : Zone) : Date {
    return DateUtil.addBusinessDays(this, iDays, location)
  }
  /**
     * Adds the specified (signed) number of business days to the given date,
     * based on a location which may determine which holiday schedule is consulted.
     * The time of day of the given date is preserved in the result.
     *
     * @param iDays The number of business days to add.
     * @param location The location.
     * @return A new date with the business days added.
     */
  function addBusinessDays(iDays : int, location : AddressBase) : Date {
    return DateUtil.addBusinessDays(this, iDays, location)
  }
  /**
     * Adds the specified signed number of business hours to the given date,
     * based on a holiday tag code which will determine which holiday schedule is consulted.
     *
     * @param iHours The number of business hours to add.
     * @param tagCode The holiday tag code.
     * @param businessWeekType Either a zone or an address indicating which businessWeek to fetch. If null is passed in, it will use the
     * default one.
     * @return A new date with the business hours added.
     */
  function addBusinessHours(iHours : int, tagCode : HolidayTagCode, businessWeekType : Object) : Date {
    return DateUtil.addBusinessHours(this, iHours, tagCode, businessWeekType )
  }
  /**
     * Adds the specified signed number of business hours to the given date,
     * based on a location which may determine which holiday schedule is consulted.
     *
     * @param iHours The number of business hours to add.
     * @param location The location.
     * @return A new date with the business hours added.
     */
  function addBusinessHours(iHours : int, location : Zone) : Date {
    return DateUtil.addBusinessHours(this, iHours, location )
  }
  /**
     * Adds the specified signed number of business hours to the given date,
     * based on a location which may determine which holiday schedule is consulted.
     *
     * @param iHours The number of business hours to add.
     * @param location The location.
     * @return A new date with the business hours added.
     */
  function addBusinessHours(iHours : int, location : AddressBase) : Date {
    return DateUtil.addBusinessHours(this, iHours, location)
  }
  /**
     * Calculates the difference in business days between two dates,
     * based on a holiday tag code which will determine which holiday schedule is consulted.
     * The time of day of each given date is ignored.
     *
     * @param toDate The end date (the left operand in the subtraction).
     * @param tagCode The holiday tag code.
     * @param businessWeekType Either a zone or an address indicating which businessWeek to fetch. If null is passed in, it will use the
     * default one.
     * @return The number of business days between the two dates. If toDate is
     *     later than fromDate, this will be a positive number, and vice versa.
     */
  function businessDaysBetween(toDate : Date, tagCode : HolidayTagCode, businessWeekType : Object) : int {
    return DateUtil.businessDaysBetween(this, toDate, tagCode, businessWeekType)
  }
  /**
     * Calculates the difference in business days between two dates,
     * based on a location which may determine which holiday schedule is consulted.
     * The time of day of each given date is ignored.
     *
     * @param toDate The end date (the left operand in the subtraction).
     * @param location The location.
     * @return The number of business days between the two dates. If toDate is
     *     later than fromDate, this will be a positive number, and vice versa.
     */
  function businessDaysBetween(toDate : Date, location : Zone) : int {
    return DateUtil.businessDaysBetween(this, toDate, location)
  }
  /**
     * Calculates the difference in business days between two dates,
     * based on a location which may determine which holiday schedule is consulted.
     * The time of day of each given date is ignored.
     *
     * @param toDate The end date (the left operand in the subtraction).
     * @param location The location.
     * @return The number of business days between the two dates. If toDate is
     *     later than fromDate, this will be a positive number, and vice versa.
     */
  function businessDaysBetween(toDate : Date, location : AddressBase) : int {
    return DateUtil.businessDaysBetween(this, toDate, location)
  }
  /**
     * Calculates the difference in business hours between two dates,
     * based on a holiday tag code which will determine which holiday schedule is consulted.
     *
     * @param toDate The end date (the left operand in the subtraction).
     * @param tagCode The holiday tag code.
     * @param businessWeekType Either a zone or an address indicating which businessWeek to fetch. If null is passed in, it will use the
     * default one.          
     * @return The number of business hours between the two dates. If toDate is
     *     later than fromDate, this will be a positive number, and vice versa.
     */
  function businessHoursBetween(toDate : Date, tagCode : HolidayTagCode, businessWeekType : Object) : int {
    return DateUtil.businessHoursBetween(this, toDate, tagCode, businessWeekType)
  }
  /**
     * Calculates the difference in business hours between two dates,
     * based on a location which may determine which holiday schedule is consulted.
     *
     * @param toDate The end date (the left operand in the subtraction).
     * @param location The location.
     * @return The number of business days between the two dates. If toDate is
     *     later than fromDate, this will be a positive number, and vice versa.
     */
  function businessHoursBetween(toDate : Date, location : Zone) : int {
    return DateUtil.businessHoursBetween(this, toDate, location)
  }
  /**
     * Calculates the difference in business hours between two dates,
     * based on a location which may determine which holiday schedule is consulted.
     *
     * @param location The location.
     * @return The number of business days between the two dates. If toDate is
     *     later than fromDate, this will be a positive number, and vice versa.
     */
  function businessHoursBetween(toDate : Date, location : AddressBase) : int {
    return DateUtil.businessHoursBetween(this, toDate, location)
  }

  /**
     * Used to validate whether the date selected is on or after today.  Returns null if date is null.
     * @param date the date to be validated
     * @return  true if the given date is equal to or later than the start of day today.
     */
  function verifyDateOnOrAfterToday() : Boolean {
      return DateUtil.verifyDateOnOrAfterToday(this)
  }
  /**
     *  Creates a new Date instance initialized to the specified month, day and year.
     * @return a Date.
     */
  static function createDateInstance(iMonth : int, iDay : int, iYear : int) : Date {
      return DateUtil.createDateInstance(iMonth, iDay, iYear)
  }

  static function now() : String {
    var now = com.guidewire.pl.system.dependency.PLDependencies.getSystemClock().getDateTime()
    return gw.config.CommonServices.getCoercionManager().formatDate( now, "medium" ) + " " +
           gw.config.CommonServices.getCoercionManager().formatTime( now, "short" );
  }

  function to( otherDate : Date ) : DateRange {
    return new DateRange(this, otherDate);
  }

  function beforeOrEqual( otherDate : Date ) : boolean {
    return this.before( otherDate ) or this == otherDate
  }
  
  function afterOrEqual( otherDate : Date ) : boolean {
    return this.after( otherDate ) or this == otherDate
  }

}
