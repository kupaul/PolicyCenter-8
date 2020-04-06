package gw.job

uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.plugin.Plugins
uses gw.plugin.notification.INotificationPlugin
uses gw.api.job.EffectiveDateCalculator

enhancement CancellationEnhancement : Cancellation {
  /**
   * Calculates the CalculationMethod for the refund based on the CancelReasonCode.
   * If the CancelReasonCode is null, the CalculationMethod will also be null.
   * Otherwise, it will be the first valid refund calculation method found by
   * findValidRefundMethods().
   */
  function calculateRefundCalcMethod(inForcePeriod: PolicyPeriod): CalculationMethod {
    if (this.CancelReasonCode != null) {
      return findValidRefundMethods(inForcePeriod.PeriodStart).first()
    } else {
      return null
    }
  }

  function canEnterInitialEffectiveDate(inForcePeriod: PolicyPeriod, defaultEffectiveDate : DateTime) : boolean {
    if (inForcePeriod.Locked or inForcePeriod.Job.IntrinsicType != Cancellation) {
      var refundCalcMethod = calculateRefundCalcMethod(inForcePeriod)
      return (perm.System.cancelovereffdate)
        and refundCalcMethod != null
        and refundCalcMethod != "flat"
        and defaultEffectiveDate != null
    }
    return inForcePeriod.CancellationProcess.canEditCancellationDate().Okay
  }

  function canEditEffectiveDate(inForcePeriod : PolicyPeriod) : boolean {
    if (inForcePeriod.CancellationProcess == null) {
      return false;
    }
    return inForcePeriod.CancellationProcess.canEditCancellationDate().Okay
  }

  function findValidRefundMethods(date : DateTime) : CalculationMethod[]{
    var resultQuery = Query.make(CancelRefund)
    resultQuery.compare(CancelRefund#EffectiveDate.PropertyInfo.Name, LessThan, date)
    resultQuery.compare(CancelRefund#ReasonCode.PropertyInfo.Name, Equals, this.CancelReasonCode)
    resultQuery.or(\ restriction -> {
      restriction.compare(CancelRefund#ExpirationDate.PropertyInfo.Name, Equals, null)
      restriction.compare(CancelRefund#ExpirationDate.PropertyInfo.Name, GreaterThan, date)
    })    
    return resultQuery.select().map(\ c -> c.CalculationMethod).toSet().toTypedArray()    
  }

  /**
   * Returns the default effective date for a new cancellation, including a time
   * component as determined by the effective time plugin. If the policy is canceled
   * flat, returns the PeriodStart; otherwise calls the private helper method
   * {@link calcDefaultEffectiveDate} to determine the day, then sets the time
   * component.
   */
  function getDefaultEffectiveDate(inForcePeriod : PolicyPeriod, refundCalcMethod: CalculationMethod) : DateTime {
    return EffectiveDateCalculator.instance().getCancellationEffectiveDate(calcDefaultEffectiveDate(inForcePeriod, refundCalcMethod), inForcePeriod, this, refundCalcMethod)
  }

  /**
   * Returns the earliest effective date for a new cancellation, including a time
   * component as determined by the effective time plugin. If the policy is canceled
   * flat, returns the PeriodStart; otherwise calls the private helper method
   * {@link calcDefaultEffectiveDate} to determine the day, then sets the time
   * component.
   */
  function getEarliestEffectiveDate(inForcePeriod : PolicyPeriod, refundCalcMethod: CalculationMethod) : DateTime {
    return EffectiveDateCalculator.instance().getCancellationEffectiveDate(calcEarliestEffectiveDate(inForcePeriod, refundCalcMethod), inForcePeriod, this, refundCalcMethod)
  }

  function validateEffectiveDate(inForcePeriod : PolicyPeriod, newEffectiveDate : DateTime, refundCalcMethod : CalculationMethod) : String {
    var checkConditionFromPlugin = inForcePeriod.Policy.canStartCancellation(newEffectiveDate)
    if (checkConditionFromPlugin!= null) {
      return checkConditionFromPlugin
    } else {
      var formatString = displaykey.Web.CancellationSetup.Error.DateFormatString
      if (this.CancelReasonCode != null) {
        var earliestDate = getEarliestEffectiveDate(inForcePeriod, refundCalcMethod)
        if (newEffectiveDate < earliestDate) {
          var effDateStr = newEffectiveDate.format(formatString)
          var earliestDateStr = earliestDate.format(formatString)
          return displaykey.Web.CancellationSetup.Error.EffectiveDateTooEarly(effDateStr, earliestDateStr)
        } else {
          return null
        }
      }
      return null
    }
  }

  /**
   * Returns the default effective date for a new cancellation. The cancellation is
   * represented by a CancellationSetup (which includes the PolicyPeriod to be
   * canceled and the cancellation source) and a ReasonCode. This implementation
   * first computes the earliest and latest possible effective dates. The default
   * will be today's date if it falls within the range of valid dates; otherwise
   * the default will be the earliest possible effective date.
   */
  private function calcDefaultEffectiveDate(inForcePeriod: PolicyPeriod, refundCalcMethod: CalculationMethod) : DateTime {
    // Find the range of valid dates for the cancellation
    var earliestEffDate = calcEarliestEffectiveDate(inForcePeriod, refundCalcMethod)
    var latestEffDate = getLatestEffectiveDate(inForcePeriod, refundCalcMethod)

    // Return today's date if it's within the valid date range
    var todaysDate = DateTime.CurrentDate
    if (earliestEffDate < todaysDate and todaysDate < latestEffDate) {
      return todaysDate
    }

    // Otherwise return the earliest possible effective date
    return earliestEffDate
  }

  /**
   * Return the earliest possible effective date for a cancellation.  If the cancellation can
   * be started at the period start, return the period start.  Otherwise, calculate the maximum
   * lead time and add that to the processing date.
   */
  private function calcEarliestEffectiveDate(inForcePeriod: PolicyPeriod, refundCalcMethod: CalculationMethod) : DateTime {
    if (canCancelFromPeriodStart(inForcePeriod, refundCalcMethod)) {
      return inForcePeriod.PeriodStart
    }
    var initialProcessingDate = this.InitialNotificationDate != null ? this.InitialNotificationDate : DateTime.CurrentDate
    var leadTimeCalculator = new CancellationLeadTimeCalculator(this.CancelReasonCode,
      inForcePeriod.AllPolicyLinePatternsAndJurisdictions,
      initialProcessingDate,
      initialProcessingDate <= findUWPeriodEnd(inForcePeriod))
    var leadTime = leadTimeCalculator.calculateMaximumLeadTime()
    if (leadTime == null) {
      // the correct behavior would be to set leadTime to 0, but to maintain backward compatibility,
      // return the period start
      return inForcePeriod.PeriodStart
    }
    // The earliest effective date is initial processing date plus the lead time, but not before the period start
    var earliestEffDate = initialProcessingDate.addDays(leadTime)
    return earliestEffDate < inForcePeriod.PeriodStart ? inForcePeriod.PeriodStart : earliestEffDate
  }
  
  /**
   * Flat refunds, rewrites, insured cancellations and bound non-issued policies can cancel from the period start.
   */
  protected function canCancelFromPeriodStart(period : PolicyPeriod, refundCalcMethod : CalculationMethod) : boolean {
    return refundCalcMethod == "Flat"
      or this.CancelReasonCode == "flatrewrite"
      or this.CancelReasonCode == "midtermrewrite"
      or this.Source == "Insured"
      or period.Policy.IssueDate == null
  }
  
  /**
   * Returns the latest possible effective date for a cancellation. This is computed
   * from the PolicyPeriod to be canceled and the reason for cancellation. Rewrites
   * and flat-rate cancellations cannot be performed after the period's period
   * effective date, but all other cancellation can be done until the end of the period.
   */
  function getLatestEffectiveDate(inForcePeriod: PolicyPeriod, refundCalcMethod: CalculationMethod) : DateTime {
    if (this.CancelReasonCode == "FlatRewrite" or refundCalcMethod == "Flat") {
      return inForcePeriod.PeriodStart
    } else {
      return inForcePeriod.PeriodEnd
    }
  }

  /**
   * Returns the last date of the underwriting period for "policyPeriod". The
   * underwriting period starts from the period effective date. Its length
   * is the smallest value of UWPeriod among all NotificationConfigs that match the
   * period's states and lines.
   */
  static function findUWPeriodEnd(inForcePeriod : PolicyPeriod) : DateTime {

    // We need to find the period to use for the start of the UW period.
    // We do this by starting with the inForcePeriod and walking through the
    // BasedOn periods until we find a Submission or Rewrite.  To avoid pulling alot
    // of PolicyPeriods into memory, we just query for the few values we actually need.
    var query = Query.make(PolicyPeriod)
    query.compare("Policy", Relop.Equals, inForcePeriod.Policy)
    
    // NOTE pdalbora 6-May-2011 -- The following line ensures that inForcePeriod is in the
    // results. It won't be in the results if inForcePeriod has not yet been committed as
    // a non-temporary branch (i.e., the first commit after it's initially created), because the
    // query layer now excludes temporary branches by default.
    query.withFindTemporaryBranches(true)
    
    var periodInfos = query
      .select(\ period -> { return { period.ID, period.Job.Subtype, period.BasedOn.ID, period.PeriodStart }})
      .toList()

    // Map PolicyPeriod ids to the values returned by the query.
    var periodInfoMap = periodInfos
      .partitionUniquely(\ periodInfo -> periodInfo[0] as Key)

    // find the Submission or Renewal PolicyPeriod
    var periodId = inForcePeriod.ID
    var startDate : DateTime = null
    while (startDate == null) {
      var periodInfo = periodInfoMap.get(periodId)
      if (periodInfo == null) {
        throw displaykey.Java.PolicyPeriod.Error.MissingId(periodId)
      }
      var jobType = periodInfo[1] as typekey.Job

      if (jobType == typekey.Job.TC_SUBMISSION or
          jobType == typekey.Job.TC_REWRITENEWACCOUNT or 
          jobType == typekey.Job.TC_REWRITE) {
        startDate = periodInfo[3] as DateTime // Period Start
      } else {
        periodId = periodInfo[2] as Key // BasedOn
        if (periodId == null or periodInfoMap.get(periodId)[1] == null) {
          //conversion on renewal has a "BaseOn" period with jobType == null.
          if (jobType == typekey.Job.TC_RENEWAL) {
            startDate = periodInfo[3] as DateTime // Period Start
          } else {
            throw displaykey.Java.PolicyPeriod.Error.MissingId(periodId)
          }
        }      
      }
    }

    //  Find the length of the UW period.  Do the lookup using inForcePeriod.
    var notificationPlugin = Plugins.get(INotificationPlugin)
    var lineToJurisdictions = inForcePeriod.AllPolicyLinePatternsAndJurisdictions
    var uwPeriodLength = notificationPlugin.getMinimumLeadTime(
      inForcePeriod.PeriodStart, lineToJurisdictions, NotificationActionType.TC_UWPERIOD)

    return startDate.addDays(uwPeriodLength)
  }

    

}
