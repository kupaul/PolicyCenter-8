package gw.policy

uses gw.api.database.Query
uses gw.api.policy.period.PolicyPeriodQueryFilters
uses gw.api.util.CurrencyUtil
uses gw.job.RewriteNewAccountQueryFilters

uses java.lang.IllegalArgumentException
uses java.util.Date

enhancement PolicyEnhancement : Policy {

  /**
   * Returns all promoted periods on this policy, each of which should result
   * from the completion of a job. If this policy spans multiple periods, then
   * the periods in the result array will not all have the same PeriodID.
   */
  property get BoundPeriods(): PolicyPeriod[] {
    return this.Periods.where(\r -> r.Promoted)
  }

  /**
   * Return the latest bound policy period associated to this policy
   */
  property get LatestBoundPeriod() : PolicyPeriod {
    return this.BoundPeriods.orderByDescending(\ p -> p.PeriodStart).thenByDescending(\ p -> p.ModelDate).first()
  }

  /**
   * The latest bound policy period associated to this policy to which the
   * user has permission to view
   */
  property get LastViewableBoundPeriod() : PolicyPeriod {
    return this.BoundPeriods
      .where(\p -> perm.PolicyPeriod.view(p))
      .orderByDescending(\ p -> p.PeriodStart).thenByDescending(\ p -> p.ModelDate).first()
  }

  /**
   * Return the latest bound policy period associated to this policy
   */
  property get LatestPeriod() : PolicyPeriod {
    var period = this.LatestBoundPeriod
    if (period == null) {
      period = this.Periods.orderByDescending(\ p -> p.PeriodStart).first()
    }
    return period
  }

  /**
   * Returns all promoted and audit completed periods on this policy,
   * each of which should result from the completion of a job. If this policy spans
   * multiple periods, then the periods in the result array will not all have the same PeriodID.
   */
  property get CompletedPeriodsWithCost() : PolicyPeriod[] {
    return this.Periods.where( \ p -> p.Promoted or
                                      (p.Job typeis Audit and
                                      p.Job.AuditInformation.IsFinalAudit and
                                      p.Status == "AuditComplete"))
  }

  /**
   * Return true if the policy is issued and false otherwise.
   * A policy is issued if IssueDate is non-null
   */
  property get Issued(): boolean {
    return this.IssueDate != null
  }

  /**
   * Returns true if the policy has an open cancellation for which notices have already been sent
   */
  property get HasScheduledCancellation() : boolean {
    return this.OpenJobs.whereTypeIs(Cancellation).hasMatch(\ c -> c.PolicyPeriod.CancellationProcess.CurrentNotificationsSent)
  }

  /**
   * Returns the latest {@link BoundEditEffectiveDate} that is on or before
   * the argument date.
   */
  function findNearestBoundEditEffectiveDate(date : Date) : Date {
    return this.BoundEditEffectiveDates.where(\ d -> not d.after(date)).last()
  }

  /**
   * Return true if the policy has at least one open renewal job and false otherwise
   */
  function hasOpenRenewalJob(): boolean {
    return this.hasOpenJobOfType(Renewal)
  }

  /**
   * If this policy has been divided (e.g. split or spun) into an new Account, find all the policies divided from it, otherwise return null.
   */
  property get DividedPolicies() : Policy[] {
    return this.DividedPoliciesQryResult.toTypedArray()
  }


  /**
   * Returns true if this Policy has been rewritten to a new account and the new Policy's
   * RewriteNewAccountJob is still open.
   */
  function hasOpenRewriteNewAccountJobOnNewPolicy() : boolean {
    var policy = this.RewrittenToNewAccountDestination
    return policy != null ? policy.hasOpenJobOfType(RewriteNewAccount) : false
  }

  function findEarliestPeriodStart() : Date {
    var relevantPeriods = this.BoundPeriods
    if (relevantPeriods.HasElements){
      var boundMostRecentModels = relevantPeriods.where(\ pp -> pp.MostRecentModel)
      //get the first period start of the first 'most recent model' period
      return boundMostRecentModels.minBy(\ pp -> pp.PeriodStart).PeriodStart
    } else {
      return this.Periods.minBy(\ pp -> pp.PeriodStart).PeriodStart
    }
  }

  function findCoverageEndDate() : Date {
    var latestCoveredPeriod = findLastCoveredPeriod()
    if (latestCoveredPeriod == null) {
      return null
    }
    return latestCoveredPeriod.getCoverageEndDate()
  }

  /**
   * Finds the last PolicyPeriod which still has coverage.
   */
  function findLastCoveredPeriod() : PolicyPeriod {
    var query = Query.make(PolicyPeriod)
    var policyTable = query.join("Policy")
    policyTable.compare("Id", Equals, this.ID)
    query.or(\ rt -> rt.compare("CancellationDate", Equals, null).compare("CancellationDate", NotEquals, query.getColumnRef("PeriodStart")))

    PolicyPeriodQueryFilters.inForce(query)
    RewriteNewAccountQueryFilters.createSubselectForNextTermsAreCanceled(query)

    var results = query.select()
    results.orderByDescending(\ p -> p.PeriodStart)
    return results.Empty ? null : results.FirstResult
  }

  /**
   * Adds a referral reason to this policy if one does not already exist with the issueTypeCode
   * and key, or updates an existing referral reason otherwise. The issueTypeCode must match the
   * code of an existing UWIssueType with a checking point of "Referral", the key must not be
   * null, and the value must be valid for the UWIssueType's comparator. The referral reason's
   * status will be Open, even if it is a pre-existing reason whose status was originally Closed.
   * This method returns the new or existing referral reason.
   */
  function addReferralReason(issueTypeCode : String, key : String,
      shortDescription : block() : String, longDescription : block() : String,
          value : String) : UWReferralReason {
    var issueType = findReferralIssueType(issueTypeCode)
    if (key == null) {
      throw new IllegalArgumentException(displaykey.Policy.AddReferralReason.MissingKey)
    }
    validateValueForIssueType(issueType, value)

    var referralReason = findOrCreateReferralReason(issueType, key)
    if ( ( shortDescription != null ) || ( longDescription != null ) ) {
      referralReason.setDescriptions(shortDescription, longDescription)
    }
    referralReason.Value = value
    referralReason.Status = TC_OPEN
    return referralReason
  }

  private function findReferralIssueType(issueTypeCode : String) : UWIssueType {
    if (issueTypeCode == null) {
      throw new IllegalArgumentException(displaykey.Policy.AddReferralReason.MissingIssueTypeCode)
    }
    var issueType = UWIssueType.finder.findUWIssueTypeByCode(issueTypeCode)
    if (issueType == null) {
      throw new IllegalArgumentException(displaykey.Policy.AddReferralReason.NonexistentIssueTypeCode(issueTypeCode))
    }
    if (issueType.CheckingSet != TC_REFERRAL) {
      throw new IllegalArgumentException(displaykey.Policy.AddReferralReason.InvalidIssueTypeCode(issueTypeCode))
    }
    return issueType
  }

  private function validateValueForIssueType(issueType : UWIssueType, value : String) {
    var validationResult = issueType.ComparatorWrapper.ValueType.validate(value)
    if (validationResult != null) {
      throw new IllegalArgumentException(validationResult)
    }
  }

  private function findOrCreateReferralReason(issueType : UWIssueType, key : String) : UWReferralReason {
    var referralReason = this.UWReferralReasons.firstWhere(\ reason -> reason.IssueType == issueType and reason.IssueKey == key)
    if (referralReason == null) {
      referralReason = new UWReferralReason(this){ :IssueType = issueType, :IssueKey = key }
      this.addToUWReferralReasons(referralReason)
    }
    return referralReason
  }

  static function retrieveBoundOrLegacyRenewalPeriod(policyNumber : String, retrieveAsOfDate : Date) : PolicyPeriod {
    var period = retrievePeriod(policyNumber, retrieveAsOfDate)
    if (period == null) {
      var periodQuery = Query.make(PolicyPeriod)
      var subquery = periodQuery.join("BasedOnValue")
          subquery.compare("Status", Equals, PolicyPeriodStatus.TC_LEGACYCONVERSION)
          subquery.compare("PolicyNumber", Equals, policyNumber)
      var periods = periodQuery.select()
      period = periods.AtMostOneRow
    }
    return period
  }

  static function retrievePeriod(policyNumber : String, retrieveAsOfDate : Date) : PolicyPeriod {

    var period = entity.Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate(policyNumber, retrieveAsOfDate)
    if (period == null) {
      period = entity.Policy.finder.findMostRecentBoundPeriodByPolicyNumber(policyNumber)
    }
    if (period == null) {
      return null
    } else {
      if (not perm.PolicyPeriod.view(period)) {
        period = period.Policy.LastViewableBoundPeriod
        if (period == null) {
          return null
        }
      }
      var sliceDate = getAsOfDate(period, retrieveAsOfDate)
      return period.getSlice(sliceDate)
    }
  }

   static private function getAsOfDate(period: PolicyPeriod, asOfDate: java.util.Date): java.util.Date {
    if (asOfDate.before(period.PeriodStart)) {
      return period.PeriodStart
    } else if (not asOfDate.before(period.PeriodEnd)) {
      return period.PeriodEnd.addSeconds(-1)
    } else {
      return asOfDate
    }
   }
 }
