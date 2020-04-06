package gw.web.policy

uses pcf.PolicyFileForward
uses java.util.Date

/**
 * A helper class for selecting PolicyPeriods in the UI and potentially jumping to the found PolicyPeriod.
 */
@Export
class PolicyPeriodDatePickerHelper {

  /**
   * Finds a PolicyPeriod for a given date in one of its Policy's PolicyTerms. If no such period can be found
   * a DisplayableException will be thrown. Executes a "jump" code block after finding that PolicyPeriod.
   *
   * @param selectedDate The date by which to choose a PolicyPeriod
   * @param period The starting PolicyPeriod
   * @param jump Jump sequence after finding the PolicyPeriod
   * @return The found PolicyPeriod
   */
  static function findPolicyPeriodAsOfDate( selectedDate : java.util.Date, period : PolicyPeriod, jump(policyPeriod : PolicyPeriod, date : Date)) : PolicyPeriod {
    if (selectedDate == null) {
      return period // selectedDate is null when user enters a blank date.
    }
    var endOfSelectedDate = gw.api.util.DateUtil.endOfDay(selectedDate)
    var newPeriod = entity.Policy.finder.findPolicyPeriodByPolicyAndAsOfDate( period.Policy, endOfSelectedDate )
    if ( newPeriod != null ) {
      jump(newPeriod, endOfSelectedDate)
      return newPeriod
    }
    var dateStr = gw.api.util.StringUtil.formatDate(endOfSelectedDate, "short")
    throw new gw.api.util.DisplayableException( displaykey.Java.PolicyPeriodAsOfDateSelector.NoPeriod( dateStr ) )
  }

  /**
   * Finds a PolicyPeriod for a given date in one of its Policy's PolicyTerms. If no such period can be found
   * a DisplayableException will be thrown.
   *
   * @param selectedDate The date by which to choose a PolicyPeriod
   * @param period The starting PolicyPeriod
   * @return The found PolicyPeriod
   */
  static function findPolicyPeriodAsOfDate( selectedDate : java.util.Date, period : PolicyPeriod) : PolicyPeriod {
    return findPolicyPeriodAsOfDate(selectedDate, period, \ p, d -> void)
  }

}