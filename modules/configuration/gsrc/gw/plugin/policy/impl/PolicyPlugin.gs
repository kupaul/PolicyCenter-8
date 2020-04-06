package gw.plugin.policy.impl

uses gw.plugin.policy.IPolicyPlugin
uses java.util.Date
uses java.lang.StringBuilder
uses gw.api.job.EffectiveDateCalculator
uses gw.api.archive.PCArchivingUtil



@Export
class PolicyPlugin implements IPolicyPlugin {
  
  // ------------------------------------------------------------------------ Issuance

  /**
   * Returns whether or not an Issuance job can be started for this policy.
   *  This will be true if the following conditions are met:
   * <ul>
   * <li>There is a promoted PolicyPeriod for this policy.</li>
   * <li>There are no open jobs for this policy.</li>
   * <li>There policy is not allready issued.</li>
   * <li>The user has the permission to issue.</li>
   * <li>The policy must not be canceled.</li>
   * <li>Current term is not archived.</li>
   * </ul>
   *
   * @param policy         The policy on which the job is to be started
   * @return Null if the job can be started and a non-null error message if it cannot
   */
  override function canStartIssuance( policy: Policy ) : String {
    var period = entity.Policy.finder.findMostRecentBoundPeriodByPolicy(policy)
    if (period == null) {
      return displaykey.Job.Error.NoPeriodForEffectiveDate
    } else if (period.PolicyTerm.Archived) {
      return displaykey.Web.Job.Warning.ArchivedTerm(period.EditEffectiveDate.ShortFormat)
    }

    var sb = new StringBuilder()
    appendIfFalse(policy.OpenJobs.Count == 0, displaykey.Job.Error.OtherOpenJobs, sb)      
    appendIfFalse(not policy.Issued, displaykey.Job.Error.PolicyIssuedAlready, sb) 
    appendIfFalse(perm.Issuance.create, displaykey.Job.Error.NoIssuancePermission, sb)
    appendIfFalse(period.CancellationDate == null, displaykey.Job.Cancellation.Error.IssuePolicy, sb)
    return errorString(sb)
  }

  // ------------------------------------------------------------------------ Policy Change

  /**
   * Returns whether or not this PolicyPeriod can be changed.
   * This will be true if the following conditions are met:
   * <ul>
   * <li>The user has the "change" permission.</li>
   * <li>There is a promoted PolicyPeriod that includes "effectiveDate".</li>
   * <li>The based on PolicyPeriod is in effect at the effectiveDate.</li>
   * <li>There is no open issuance job for the policy.</li>
   * <li>There is no open rewrite job for the policy.</li>
   * <li>Current and future terms have not been archived.</li>
   * <li>The policy is issued.</li>
   * </ul>
   *
   * @param policy         The policy on which the job is to be started
   * @param effectiveDate  The effective dated at which the job is to be started
   * @return Null if the job can be started and a non-null error message if it cannot
   */
  override function canStartPolicyChange( policy: Policy, effectiveDate: Date ) : String {
    if (effectiveDate == null) {
      return displaykey.Job.Error.EnterValidEffectiveDate
    }    
    var period = entity.Policy.finder.findPolicyPeriodByPolicyAndAsOfDate(policy, effectiveDate)
    if (period == null) {
      return displaykey.Job.Error.NoPeriodForEffectiveDate
    } else if (period.PolicyTerm.Archived) {
      return displaykey.Web.Job.Warning.ArchivedTerm(period.EditEffectiveDate.ShortFormat)
    } else if (PCArchivingUtil.hasFutureArchivedTerms(period)) {
      return displaykey.Web.Job.Warning.ArchivedFutureTerm(period.EditEffectiveDate.ShortFormat)
    }
    
    var sb = new StringBuilder()
    appendIfFalse(policy.Issued, displaykey.Job.Error.PolicyNotIssued, sb)
    appendIfFalse(perm.PolicyPeriod.change(period), displaykey.Job.Error.NoChangePermission, sb)
    appendIfFalse(not policy.hasOpenRewriteJob(), displaykey.Job.Error.OpenRewriteJob, sb)
    appendIfFalse(not policy.hasOpenIssuanceJob(), displaykey.Job.Error.OpenIssuanceJob, sb)
    appendIfFalse(not policy.hasOpenRewriteNewAccountJobOnNewPolicy(), displaykey.Job.RewriteNewAccount.Error.OpenRewriteNewAccountJob, sb)
    
    var destinationPolicy = policy.RewrittenToNewAccountDestination
    if (destinationPolicy != null) {
      var startDate = destinationPolicy.findEarliestPeriodStart()
      appendIfFalse(effectiveDate < startDate,
          displaykey.Job.RewriteNewAccount.Error.PeriodStartAfterDestinationStart(startDate.ShortFormat), sb)
    }
    return errorString(sb)
  }
  
  // ------------------------------------------------------------------------ Cancellation

  /**
   * Returns whether or not this Policy can be canceled.
   * This will be true if the following conditions are met:
   * <ul>
   * <li>There is a promoted PolicyPeriod that includes "effectiveDate".</li>
   * <li>The user has the "cancel" permission.</li>
   * <li>The policy is not already canceled as of "effectiveDate".
   * <li>There is no open issuance job for the policy.</li>
   * <li>There is no open rewrite job for the policy.</li>
   * <li>Current and future terms have not been archived.</li>
   * </ul>
   *
   * @param policy         The policy on which the job is to be started
   * @param effectiveDate  The effective dated at which the job is to be started
   * @return Null if the job can be started and a non-null error message if it cannot
   */
  override function canStartCancellation( policy: Policy, effectiveDate: Date ) : String {
    if (effectiveDate == null) {
      return displaykey.Job.Error.EnterValidEffectiveDate
    }    
    var period = entity.Policy.finder.findPolicyPeriodByPolicyAndAsOfDate(policy, effectiveDate)
    if (period == null) {
      return displaykey.Job.Error.NoPeriodForEffectiveDate
    } else if (period.PolicyTerm.Archived) {
      return displaykey.Web.Job.Warning.ArchivedTerm(period.EditEffectiveDate.ShortFormat)
    } else if (PCArchivingUtil.hasFutureArchivedTerms(period)) {
      return displaykey.Web.Job.Warning.ArchivedFutureTerm(period.EditEffectiveDate.ShortFormat)
    }
       
    var sb = new StringBuilder()
    appendIfFalse(perm.PolicyPeriod.cancel(period), displaykey.Job.Cancellation.Error.NoCancelPermission, sb)
    appendIfFalse(not period.Canceled or effectiveDate < period.CancellationDate, displaykey.Job.Cancellation.Error.AlreadyCanceled, sb)
    appendIfFalse(not policy.hasOpenRewriteJob(), displaykey.Job.Error.OpenRewriteJob, sb)    
    appendIfFalse(not policy.hasOpenIssuanceJob(), displaykey.Job.Error.OpenIssuanceJob, sb)
    appendIfFalse(not policy.hasOpenRewriteNewAccountJobOnNewPolicy(), displaykey.Job.RewriteNewAccount.Error.OpenRewriteNewAccountJob, sb)
    return errorString(sb)
  }

  // ------------------------------------------------------------------------ Reinstate

  /**
   * Returns whether or not this PolicyPeriod can be reinstated.
   * This will be true if the following conditions are met:
   * <ul>
   * <li>The user has the permission to reinstate.</li>
   * <li>The policy is canceled".
   * <li>The policy does not have an open rewrite job.</li>
   * <li>The policy does not have an open issuance job.</li>
   * <li>The policy does not have an open reinstate job for this period already.</li>
   * <li>The policy is issued.</li>
   * <li>The reinstatement period should not overlap any existing bound period.</li>
   * <li>Current and future terms have not been archived.</li>
   * </ul>
   *
   * @param policyPeriod  The policy period that is canceled and needs reinstatement
   * @return Null if the job can be started and a non-null error message if it cannot
   */
  override function canStartReinstatement( policyPeriod: PolicyPeriod ) : String {
    var period = entity.Policy.finder.findMostRecentBoundPeriodByPolicyPeriod(policyPeriod)
    if (period == null) {
      return displaykey.Job.Reinstatement.Error.NoRecentBoundPeriod
    } else if (period.PolicyTerm.Archived) {
      return displaykey.Web.Job.Warning.ArchivedTerm(period.EditEffectiveDate.ShortFormat)
    } else if (PCArchivingUtil.hasFutureArchivedTerms(period)) {
      return displaykey.Web.Job.Warning.ArchivedFutureTerm(period.EditEffectiveDate.ShortFormat)
    } 

    var sb = new StringBuilder()
    appendIfFalse(perm.PolicyPeriod.reinstate(period), displaykey.Job.Reinstatement.Error.NoReinstatePermission, sb)
    appendIfFalse(period.CancellationDate != null, displaykey.Job.Error.PolicyNotCanceled, sb)
    appendIfFalse(not period.Policy.hasOpenRewriteJob(), displaykey.Job.Error.OpenRewriteJob, sb)
    appendIfFalse(not period.Policy.hasOpenIssuanceJob(), displaykey.Job.Error.OpenIssuanceJob, sb)
    appendIfFalse(not period.Policy.hasOpenReinstateJobForPeriod(period), displaykey.Job.Reinstatement.Error.OpenReinstate, sb)
    appendIfFalse(not period.Policy.hasOpenRewriteNewAccountJobOnNewPolicy(), displaykey.Job.RewriteNewAccount.Error.OpenRewriteNewAccountJob, sb)
    appendIfFalse(not period.isRewrittenToNewAccountAndCanceledLocked(), displaykey.Job.RewriteNewAccount.Error.CanceledAndExistingRewriteNewAccountJob, sb)
    appendIfFalse(period.Policy.Issued, displaykey.Job.Error.PolicyNotIssued, sb)
    if (period.CancellationDate != null) {
      //check if there is a window for the reinstatement to exist without an overlap
      var reinstatementExpDate = EffectiveDateCalculator.instance().getReinstatementExpirationDate(period.CancellationDate, period.PeriodEnd, period, null)
      appendIfFalse(reinstatementExpDate > period.CancellationDate, displaykey.Job.Reinstatement.Error.OverlapPeriod, sb)
    }
    return errorString(sb)
  }

  // ------------------------------------------------------------------------ Rewrite

  /**
   * Returns whether or not this PolicyPeriod can be rewritten.
   * This will be true if the following conditions are met:
   * <ul>
   * <li>The user has the permission to rewrite.</li>
   * <li>There is a promoted PolicyPeriod that includes "effectiveDate".</li>
   * <li>The policy period must be canceled</li>
   * <li>"effectiveDate" must be after the cancellation date</li>
   * <li>There are no open jobs other than Audit on the policy</li>
   * <li>The policy is issued.</li>
   * <li>The rewrite period should not overlap any existing bound period.</li>
   * <li>Current term is not archived.</li>
   * </ul>
   *
   * @param policy         The policy on which the job is to be started
   * @param effDate        The effective date of the rewrite period
   * @param expDate        The expiration date of the rewrite period
   * @return Null if the job can be started and a non-null error message if it cannot
   */
  override function canStartRewrite( policy: Policy, effectiveDate: Date, expirationDate: Date ) : String {
    var period = entity.Policy.finder.findPolicyPeriodByPolicyAndAsOfDate(policy, effectiveDate)
    
    if (period == null) {
      return displaykey.Job.Error.NoPeriodForEffectiveDate
    } else if (period.PolicyTerm.Archived) {
      return displaykey.Web.Job.Warning.ArchivedTerm(period.EditEffectiveDate.ShortFormat)
    }
    
    var sb = new StringBuilder()
    appendIfFalse(perm.PolicyPeriod.rewrite(period), displaykey.Job.Rewrite.Error.NoRewritePermission, sb)
    appendIfFalse(period.CancellationDate != null, displaykey.Job.Error.PolicyNotCanceled, sb)
    appendIfFalse(effectiveDate >= period.CancellationDate, displaykey.Job.Rewrite.Error.EffectiveBeforeCancelDate, sb)            
    appendIfFalse(policy.OpenJobs.countWhere(\j -> j.Subtype != "Audit") == 0, displaykey.Job.Rewrite.Error.OpenJobs, sb)
    appendIfFalse(not period.Policy.hasOpenRewriteNewAccountJobOnNewPolicy(), displaykey.Job.RewriteNewAccount.Error.OpenRewriteNewAccountJob, sb)
    appendIfFalse(not period.isRewrittenToNewAccountAndCanceledLocked(), displaykey.Job.RewriteNewAccount.Error.CanceledAndExistingRewriteNewAccountJob, sb)
    appendIfFalse(policy.Issued, displaykey.Job.Error.PolicyNotIssued, sb)
    var hasOverlap = period.isOverlappingBoundPeriods(effectiveDate, expirationDate)
    appendIfFalse(!hasOverlap, displaykey.Job.Rewrite.Error.OverlapPeriod, sb)
    return errorString(sb)
  }


  /**
   * Returns whether or not this policy can be rewritten to a new account. This method will return
   * null (indicating that the rewrite can be started) if the following conditions are met:
   * 
   * <ul>
   * <li>If the based on period is canceled, then the effective date of the rewritten policy must
   *     be after the cancellation date. This corresponds to the case where a user is rewriting a
   *     canceled policy.</li>
   * <li>If the based on period is not canceled, then the effective date of the rewritten policy
   *     must be after the end of the period. This corresponds to the case where a user is 
   *     rewriting an expired policy.</li>
   * <li>The user has permission to rewrite the period to a new account.</li>
   * <li>The effective date range of the rewritten policy does not overlap any other in-force
   *     period of the original policy.</li>
   * <li>The policy is issued.</li> 
   * <li>There are no other open jobs on the policy with the exception of audits.</li>
   * <li>The policy is not being rewritten to the same account.</li>
   * <li>Current term is not archived.</li>
   * </ul>
   * 
   * @param policyPeriod The period on which the job is to be started. This will never be null.
   *                     If the rewrite is started against an expired policy, then this will be the most
   *                     recent PolicyPeriod in force. Otherwise if the rewrite is started against a
   *                     canceled policy, this will be the PolicyPeriod in force as of "effDate". 
   * @param effDate      The desired effective date of the rewritten period. This will never be null,
   *                     and it will always be on or after the PeriodStart date of "policyPeriod".
   * @param expDate      The desired expiration date of the rewritten period. This will never be null.
   * @param account      The new account to which the policy will be rewritten. This will never be null.
   * @return             Null if the job can be started and a non-null error message if it cannot.
   */
  override function canStartRewriteNewAccount(basedOn : PolicyPeriod, effectiveDate : Date, expirationDate : Date, account : Account) : String {
    if (basedOn.PolicyTerm.Archived) {
      return displaykey.Web.Job.Warning.ArchivedTerm(basedOn.EditEffectiveDate.ShortFormat)
    }
    
    var sb = new StringBuilder()
    var earliestDate = basedOn.Canceled ? basedOn.CancellationDate : basedOn.PeriodEnd
    appendIfFalse(effectiveDate.afterOrEqual(earliestDate), displaykey.Job.RewriteNewAccount.Error.NotCanceledOrExpired(effectiveDate), sb)
    appendIfFalse(perm.PolicyPeriod.rewritenewaccount(basedOn), displaykey.Job.RewriteNewAccount.Error.NoPermission, sb)
    appendIfFalse(basedOn.Policy.findMostRecentNoncancelledBoundPeriodWithinDateRange(effectiveDate, null) == null, displaykey.Job.RewriteNewAccount.Error.PolicyInForce, sb)
    appendIfFalse(basedOn.Policy.Issued, displaykey.Job.Error.PolicyNotIssued, sb)
    appendIfFalse(basedOn.Policy.OpenJobs.countWhere(\j -> j.Subtype != typekey.Job.TC_AUDIT) == 0, displaykey.Job.RewriteNewAccount.Error.OpenJobs, sb)
    appendIfFalse(basedOn.Policy.Account != account, displaykey.Job.RewriteNewAccount.Error.SameAccount, sb)
    return errorString(sb)
  }

  // ------------------------------------------------------------------------ Renewal

  /**
   * Returns whether or not this PolicyPeriod can be rewritten.
   * This will be true if the following conditions are met:
   * <ul>
   * <li>There must be a bound period for this policy.</li>
   * <li>The user has the permission to create and complete a renewal job.</li>
   * <li>The policy is issued.</li>
   * <li>The policy does not have an open rewrite job.</li>
   * <li>The policy does not have an open renewal job.</li>
   * <li>The policy must not be canceled.</li>
   * <li>Current term is not archived.</li>
   * </ul>
   * If the most-recent-bound period is a cancelled period, make a second search for
   * the most-recent-noncancelled-bound period that has a start date within 90 (or so) days
   * of the cancelled period.  If one exists, a rewrite for example, use that period.
   * 
   * @param policy         The policy on which the job is to be started
   * @param effDate        The effective date of the rewrite period
   * @param expDate        The expiration date of the rewrite period
   * @return Null if the job can be started and a non-null error message if it cannot
   */
  override function canStartRenewal( policy: Policy ) : String {
    var period = policy.getMostRecentBoundPeriodOnMostRecentTerm()
    if (period == null) {
      return displaykey.Job.Renewal.Error.NoPeriod
    }
    if (period.PolicyTerm.Archived) {
      return displaykey.Web.Job.Warning.ArchivedTerm(period.EditEffectiveDate.ShortFormat)
    }

    var sb = new StringBuilder()
    appendIfFalse(perm.Renewal.create, displaykey.Job.Renewal.Error.NoCreateRenewPermission, sb)
    appendIfFalse(policy.Issued, displaykey.Job.Error.PolicyNotIssued, sb)
    appendIfFalse(not policy.hasOpenRewriteJob(), displaykey.Job.Error.OpenRewriteJob, sb)
    appendIfFalse(not policy.hasOpenRenewalJob(), displaykey.Job.Renewal.Error.OpenRenewal, sb)
    appendIfFalse(policy.RewrittenToNewAccountDestination == null, displaykey.Job.RewriteNewAccount.Error.ExistingRewriteNewAccountJob, sb)
    appendIfFalse(perm.PolicyPeriod.renew(period), displaykey.Job.Renewal.Error.NoRenewPermission, sb)
    appendIfFalse(not period.Canceled, displaykey.Job.Renewal.Error.PolicyCanceled, sb)
    return errorString(sb)
  }

  // ------------------------------------------------------------------------ Audit

  /**
   * Returns whether or not an audit can be started on this policy.
   * This will be true if the following conditions are met:
   * <ul>
   * <li>The user has the permission to create and complete an audit job.</li>
   * <li>The policy is issued.</li>
   * </ul>
   *
   * @param policy         The policy on which the job is to be started
   * @return Null if the job can be started and a non-null error message if it cannot
   */
  @Deprecated("Deprecated in PC 7.0.3; use canStartAudit(policy : Policy, effectiveDate : Date) instead")
  override function canStartAudit( policy: Policy ) : String {
    var sb = new StringBuilder()
    appendIfFalse(perm.Audit.start, displaykey.Job.Error.NoAuditPermission, sb)
    appendIfFalse(policy.Issued, displaykey.Job.Error.PolicyNotIssued, sb)
    return errorString(sb)
  }

  /**
   * Returns whether or not an audit can be started on this policy.
   * This will be true if the following conditions are met:
   * <ul>
   * <li>The user has the permission to create and complete an audit job.</li>
   * <li>The policy is issued.</li>
   * <li>Current term is not archived.</li>
   * </ul>
   *
   * @param policy         The policy on which the job is to be started
   * @param effectiveDate  The date at which the audit should be started
   * @return Null if the job can be started and a non-null error message if it cannot
   */
  override function canStartAudit( policy: Policy, effectiveDate : Date ) : String {
    if (effectiveDate == null) {
      return displaykey.Job.Error.EnterValidEffectiveDate
    }    
    var period = entity.Policy.finder.findPolicyPeriodByPolicyAndAsOfDate(policy, effectiveDate)
    if (period == null) {
      return displaykey.Job.Error.NoPeriodForEffectiveDate
    } else if (period.PolicyTerm.Archived) {
      return displaykey.Web.Job.Warning.ArchivedTerm(period.EditEffectiveDate.ShortFormat)
    }
    
    var sb = new StringBuilder()
    appendIfFalse(perm.Audit.start, displaykey.Job.Error.NoAuditPermission, sb)
    appendIfFalse(policy.Issued, displaykey.Job.Error.PolicyNotIssued, sb)
    return errorString(sb)
  }

  // ------------------------------------------------------------------------ private

  private static function appendIfFalse(condition: boolean, message: String, sb: StringBuilder) {
    if (not condition) {
      appendMessage( message, sb )
    }
  }
  
  private static function appendMessage( message : String, sb : StringBuilder ) {
    sb.append(message + ", ")
  }
  
  private static function errorString(sb: StringBuilder): String {
    var s = sb.toString().trim()
    if (s.endsWith(",")) {
      s = s.substring(0, s.size - 1)
    }
    return s.length() == 0 ? null : s
  }

}
