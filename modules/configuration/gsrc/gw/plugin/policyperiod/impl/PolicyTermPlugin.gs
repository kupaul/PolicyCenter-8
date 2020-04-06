package gw.plugin.policyperiod.impl

uses gw.api.util.DisplayableException
uses gw.plugin.policyperiod.IPolicyTermPlugin

uses java.lang.Math
uses java.util.Calendar
uses java.util.Date
uses gw.api.web.util.PCDateUtil
uses gw.api.util.DateUtil

@Export
class PolicyTermPlugin implements IPolicyTermPlugin {

  /**
   * Given the effective date, the term for a PolicyPeriod, and the PolicyPeriod,
   * return the default expiration date.  This should always return a non-null date.
   *
   * @param effDate  the policy period effective or start date
   * @param term the policy period term
   * @param policyPeriod the policy period
   *
   * Implementation Note: Called from Java.
   * Every TermType should be mentioned, the period expiration date must be set.
   * The time part of the returned expiration date will be ignored, in favor
   * of the existing expiration time (as set by the effective time plugin).
   * @return The calculated period end date
   */
  override function calculatePeriodEnd( effDate : Date, term : TermType, policyPeriod : PolicyPeriod ): Date {
    if (effDate == null) {
      return null
    }
    var futureDate : Date
    switch (term) {
      case TermType.TC_ANNUAL:
        futureDate = effDate.addYears(1)
        break
      case TermType.TC_HALFYEAR:
        futureDate = effDate.addMonths(6)
        break
      case TermType.TC_OTHER:
        futureDate = effDate.addMonths(3)
        break
      default:
        throw new DisplayableException(displaykey.PolicyTermPlugin.CalculatePeriodEnd.MissingFormulaForTermType(term.Code))
    }
    // Date drifting occurs when a PolicyTerm of a given TermType (or multiple PolicyTerms)
    // does not cover the expected number of days.
    // E.g.
    // Two PolicyTerms with the TermType HalfYear should provide exactly one year of
    // coverage, the subsequent code ensures that behavior.
    // Date reconciliation only occurs for PolicyPeriods with Jobs that support date reconciliation.
    if (shouldPerformDateReconciliation(policyPeriod)) {
      futureDate = reconcileEndDate(effDate, futureDate, policyPeriod, term)
    }
    return futureDate
  }

  /**
   * Given a set of period dates calculates the policy term.
   *
   * Implementation Note: Called from Java
   */
  override function calculatePolicyTerm(policyPeriod : PolicyPeriod, periodStart: Date, periodEnd: Date): TermType {
    // Make calculations time-insensitive
    periodStart = periodStart.trimToMidnight()
    periodEnd = periodEnd.trimToMidnight()
    
    var terms = policyPeriod.Policy.Product.AvailablePolicyTerms.map(\term -> term.TermType)    
    
    var annual = TermType.TC_ANNUAL
    var halfYear = TermType.TC_HALFYEAR
    if (isAnnualTerm(policyPeriod, terms, periodStart, periodEnd)) {
      return annual
    } else if (isTermType(terms, halfYear, periodStart, periodEnd, policyPeriod)) {
      return halfYear
    } else {
      return TermType.TC_OTHER
    }
  }
  
  private function isAnnualTerm(policyPeriod : PolicyPeriod, terms : List<typekey.TermType>, periodStart: Date, periodEnd: Date): boolean {    
    var maxAdditionalDays = 0
    for (line in policyPeriod.Lines) {
      maxAdditionalDays = Math.max(maxAdditionalDays, line.AdditionalDaysInAnnualTerm)
    }
    
    if (maxAdditionalDays != 0) {
      var minExpDate = calculatePeriodEnd(periodStart, TermType.TC_ANNUAL, policyPeriod)
      var maxExpDate = calculatePeriodEnd(periodStart, TermType.TC_ANNUAL, policyPeriod).addDays(maxAdditionalDays)
      if (not periodEnd.before(minExpDate) and not periodEnd.after(maxExpDate)) {
        return true
      }
    }
    
    return isTermType(terms, TermType.TC_ANNUAL, periodStart, periodEnd, policyPeriod)
  }
  
  private function isTermType(terms : List<typekey.TermType>, theTermType : TermType, periodStart: Date, periodEnd: Date, policyPeriod : PolicyPeriod): boolean {
    return 
      (periodEnd == calculatePeriodEnd(periodStart, theTermType, policyPeriod) and terms.contains(theTermType))
  }


  private function shouldPerformDateReconciliation(policyPeriod : PolicyPeriod) : boolean {
    return (policyPeriod != null)
        and (policyPeriod.Job == null
        or policyPeriod.Job.shouldPerformDateReconciliation())
  }

  /**
   * In most circumstances, PolicyPeriods should have PeriodEnd Dates on the same
   * day of the month as the PeriodStart Date of the previous PolicyPeriod.
   * However, if the PeriodStart Date's day of the month is greater than the
   * unreconciled endDate's day of the month, or the PeriodStart Date was
   * on the last day of a month, reconcile the endDate to the last day of the
   * current month.
   * A special case is connecting two half year terms.  In this situation, the
   * end date of the second term should line up with the start date of the first
   * so that together, they cover one year just as an Annual Term would
   * Annual terms will naturally have the same date, but will be adjusted for leap year.
   */
  private function reconcileEndDate(effDate : Date, futureDate : Date, policyPeriod : PolicyPeriod, term : TermType) : Date {
    if (TermType.TC_HALFYEAR == term) {
      return reconcileEndDateToPreviousTermStartDateIfPossible(effDate, futureDate, policyPeriod)
    } else if (shouldReconcileToLastDayOfMonth(effDate, futureDate)) {
      return PCDateUtil.setToEndOfMonth(futureDate)
    }
    return futureDate
  }

  /**
   * This method handles the special case when connecting two half year terms.
   * Assuming the conditions are met, the end date of the second term should
   * line up with the start date of the first.  The conditions are as follows:
   * ** must have a previous period (basedOn)
   * ** no gap in coverage
   * ** previous term also 1/2 year
   *
   * In this case, use the PeriodStart of the basedOn Period to determine what
   * day of the month (or end of the month) to use
   *
   * There is a flaw in this algorithm for 1/2 year terms created on 2/28 in a
   * leap year.  In the next leap year (4 years later), the PeriodStart of the
   * basedOn Period will have been at the end of the month.  As a result, it
   * will set the PeriodEnd to be 2/29 instead of the expected 2/28.  Trying to
   * correct this by looking back over all previous terms was seen as too expensive.
   **/
  private function reconcileEndDateToPreviousTermStartDateIfPossible(effDate : Date, futureDate : Date, policyPeriod : PolicyPeriod) : Date {
    if (policyPeriod.BasedOn != null                                    // need previous period
        and !policyPeriod.BasedOn.Archived
        and DateUtil.compareIgnoreTime(effDate, policyPeriod.BasedOn.PeriodEnd) == 0  // no gap in coverage
        and policyPeriod.BasedOn.TermType == TermType.TC_HALFYEAR) {    // previous term also 1/2 year
      if (isLastDayOfMonth(policyPeriod.BasedOn.PeriodStart)) {
        return PCDateUtil.setToEndOfMonth(futureDate)
      } else {
        var dayOfMonthIfTreatedAsAnnualTerm = DateUtil.getDayOfMonth(policyPeriod.BasedOn.PeriodStart)
        return PCDateUtil.setToDayOfMonth(futureDate, dayOfMonthIfTreatedAsAnnualTerm)
      }
    } else if (shouldReconcileToLastDayOfMonth(effDate, futureDate)) {  // else reconcile with start if needed
      return PCDateUtil.setToEndOfMonth(futureDate)
    }
    return futureDate
  }


  /**
   * @param startDate the current period's PeriodStart date or the policy inception date
   * @param endDate the unreconciled endDate
   *
   * If the startDate's day of the month is greater than the unreconciled endDate's
   * day of the month, or if the startDate is on the last day of the month, the endDate
   * should be reconciled to the last day of it's month.
   */
  private function shouldReconcileToLastDayOfMonth(startDate : Date, endDate : Date) : boolean {
    return isLastDayOfMonth(startDate) or startDate.DayOfMonth > getDaysInMonth(endDate)
  }

  private function getDaysInMonth(date : Date) : int {
    return date.Calendar.getActualMaximum(Calendar.DAY_OF_MONTH)
  }

  private function isLastDayOfMonth(date : Date) : boolean {
    return date.DayOfMonth == getDaysInMonth(date)
  }
}
