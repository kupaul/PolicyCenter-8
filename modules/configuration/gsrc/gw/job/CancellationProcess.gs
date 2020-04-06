package gw.job

uses gw.api.diff.DiffItem
uses gw.api.job.EffectiveDateCalculator
uses gw.api.job.JobProcessLogger
uses gw.api.job.JobStateException
uses gw.forms.FormInferenceEngine
uses gw.job.cancellation.CancellationProcessValidator
uses gw.job.permissions.CancellationPermissions
uses gw.plugin.messaging.BillingMessageTransport
uses java.lang.IllegalArgumentException
uses java.lang.UnsupportedOperationException
uses java.util.ArrayList
uses gw.plugin.Plugins
uses gw.plugin.reinsurance.IReinsurancePlugin
uses gw.api.util.MonetaryAmounts
uses java.lang.IllegalStateException

/**
 * Encapsulates the actions taken within a Cancellation job.
 *
 * @see JobProcess for general information and job process logic.
 * @see gw.plugin.policyperiod.impl.JobProcessCreationPlugin
 */
@Export
class CancellationProcess extends JobProcess {

  construct(period : PolicyPeriod) {
    super(period, new CancellationPermissions(period.Job))
    JobProcessEvaluator = JobProcessUWIssueEvaluator.forCancellation()
    JobProcessValidator = new CancellationProcessValidator()
  }

  override property get Job() : Cancellation {
    return super.Job as Cancellation
  }

  property get ActiveCancellationWorkflow() : CompleteCancellationWF {
    var workflow = _branch.ActiveWorkflow
    return (workflow == null or not (workflow typeis CompleteCancellationWF) or workflow.State == TC_COMPLETED)
            ? null
            : (workflow as CompleteCancellationWF)
  }

  override property get BillingSubjectToFinalAudit() : boolean {
    return _branch.hasScheduledFinalAudit() or _branch.hasOpenFinalAudit()
  }

  private property get InitialNotificationsHaveBeenSent() : boolean {
    return Job.InitialNotificationDate != null
  }
  
  property get CurrentNotificationsSent() : boolean {
    return (Job.CancelProcessDate != null and Job.LastNotifiedCancellationDate != null and Job.LastNotifiedCancellationDate == _branch.CancellationDate)
  }

  // ===== LIFECYCLE FUNCTIONS =====

  /**
   * Checks the conditions for which the policy period can be canceled.
   */
  function canStart() : JobConditions {
    return canStartJob("start cancellation")
  }

  /**
   * Initiates the cancellation.
   */
  override function start() {
    canStart().assertOkay()
    JobProcessLogger.logDebug("Starting cancellation on branch: ${_branch}")
    startJobAsDraft()
    Job.assignRolesFromPolicy()
    var renewal = _branch.Policy.OpenRenewalJob
    if (renewal != null) {
      renewal.createRoleActivity(TC_UNDERWRITER,
                                 ActivityPattern.finder.getActivityPatternByCode("notification"),
                                 displaykey.Job.Cancellation.CancellationForRenewal,
                                 displaykey.Job.Cancellation.OpenRenewal(_branch.PolicyNumber))
    }
    requestQuote()
  }

  /**
   * Adds Canceling and Rescinding to the list of statuses from which edit
   * mode can be entered.
   */
  override protected property get AllowedEditStatus() : PolicyPeriodStatus[] {
    return { TC_QUOTING, TC_QUOTED, TC_CANCELING, TC_RESCINDING }
  }

  /**
   * Checks the conditions for which the policy period can be switched
   * to edit mode ("Draft" status).
   */
  override function canEdit() : JobConditions {
    var cancellationCondition = super.canEdit()
    var canSendNotifications = not CurrentNotificationsSent or Permissions.RescheduleCancellation
    return cancellationCondition
             .checkCondition(canSendNotifications, displaykey.Web.Cancellation.Error.NotificationsSent)
  }

  /**
   * Switches the policy period to edit mode.
   * Note that some of this code is duplicated in processSpecificPreemptionHandling below.
   */
  override function edit() {
    Job.CancelProcessDate = null
    super.edit()
    removeCancellationWorkflow()
  }

  private function removeCancellationWorkflow() {
    if (ActiveCancellationWorkflow != null) {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
        bundle.add(ActiveCancellationWorkflow)
        ActiveCancellationWorkflow.remove()
      })
      _branch.ActiveWorkflow = null
    }
  }

  /**
   * Checks the conditions for which the policy period can be quoted.
   */
  override function canRequestQuote() : JobConditions {
    return super.canRequestQuote()
            .checkNotNull(Job.PolicyPeriod.RefundCalcMethod, "RefundCalcMethod is null")
            .checkFlatCancelOnPeriodStart()
            .checkDraft()
            .checkNoUnhandledPreemptions()
  }

  /**
   * Checks the conditions for which the cancellation can be scheduled.
   */
  function canScheduleCancellation() : JobConditions {
    var jobConditions = canIssue("schedule cancellation")

    addScheduleCancellationChecks(jobConditions)
    jobConditions
        .checkCondition(!InitialNotificationsHaveBeenSent, displaykey.Web.Cancellation.Error.NotificationsSent)

    return jobConditions
  }

  /**
   * checks the conditions for which the presumptive date of the cancellation
   * can be changed. Slightly different from the conditions under which the process
   * of actually scheduling the Cancellation can be started.
   */
  function canEditCancellationDate() : JobConditions {
    var jobConditions = startChecksFor("edit cancellation date")

    addSetCancellationDateChecks(jobConditions)
    addNotificationChecks(jobConditions)

    jobConditions
      .checkPermission(perm.System.cancelovereffdate)
      .checkCondition(not CurrentNotificationsSent, displaykey.Web.Cancellation.Error.NotificationsResent)
      .checkCondition(_branch.RefundCalcMethod != TC_FLAT, "Cannot edit cancellation date for a flat cancellation")

    return jobConditions
  }

  /**
   * Checks the conditions for which the cancellation can be escheduled.
   */
  function canRescheduleCancellation() : JobConditions {
    var jobConditions = startChecksFor("reschedule cancellation")

    addScheduleCancellationChecks(jobConditions)

    jobConditions
      // comment out the following line to allow rescheduleCancellation to also do initial scheduling
      .checkCondition(InitialNotificationsHaveBeenSent, displaykey.Web.Cancellation.Error.NotScheduled)
      .checkCondition(not CurrentNotificationsSent, displaykey.Web.Cancellation.Error.NotificationsResent)
      .checkStatus(TC_QUOTED)

    return jobConditions
  }

  private function addSetCancellationDateChecks(jobConditions : JobConditions) : JobConditions {
    return jobConditions
        .checkAdvancePermission()
        .checkBranchNotLocked()
        .checkNoUnhandledPreemptions()
  }

  private function addScheduleCancellationChecks(jobConditions : JobConditions) : JobConditions {
    addSetCancellationDateChecks(jobConditions)

    return jobConditions
        .checkQuoteIsValid()
        // Uncomment this line to disable the ability to schedule more than one Cancellation at a time. Note that only
        // one Cancellation will be allowed to bind, the other will automatically be withdrawn at that time.
        // .checkCondition(!_branch.HasScheduledCancellation, "Another Cancellation is already scheduled for this policy")
  }

  private function addNotificationChecks(jobConditions : JobConditions) : JobConditions {
    // Need special permission to reschedule a cancellation after notices have been sent
    if (InitialNotificationsHaveBeenSent and !Permissions.RescheduleCancellation) {
      // Report both problems together
      jobConditions
        .checkCondition(!InitialNotificationsHaveBeenSent, displaykey.Web.Cancellation.Error.NotificationsSent)
        .checkPermission(Permissions.RescheduleCancellation)
    }
    return jobConditions
  }

  /**
   * Adjusts the cancellationDate according to the EffectiveTimePlugin and makes this cancellation effective
   * as of the resulting date.
   * Will fail if the date lies outside of the current slice.
   */
  function setCancellationDate(cancellationDate : DateTime) {
    canEditCancellationDate().assertOkay()
    var effDateTime = EffectiveDateCalculator.instance().getCancellationEffectiveDate(cancellationDate, _branch, _branch.Cancellation, _branch.RefundCalcMethod)

    var errorMessage = Job.validateEffectiveDate(_branch, effDateTime, _branch.RefundCalcMethod)
    if (errorMessage != null) {
      throw new IllegalArgumentException(errorMessage)
    }
    JobProcessLogger.logInfo("Changing cancellation date to ${effDateTime} for branch \"${_branch}\"")
    var withinPeriod = startChecksFor("Cross slice boundaries")
      .checkDateWithinPeriodOrTerm(effDateTime).Okay // this check need to be done before setting EED below
    _branch.EditEffectiveDate = effDateTime
    _branch.cancel(effDateTime)
    if (withinPeriod) {
      _branch.updateEditEffectiveDateForReinsurance(_branch)
    } else {
      JobProcessLogger.logInfo("Could not apply reinsurance change to new effective date:${effDateTime} for branch \"${_branch}\"")
      var plugin = Plugins.get(IReinsurancePlugin)
      plugin.withdrawBranch(_branch)
    }
  }

  /**
   * Schedules the cancellation to take place on the given processDate.  This will run through UW approval,
   * and if approved it will send notices and then start the cancellation workflow.
   *
   * @param processDate the date on which cancellation takes place
   */
  function scheduleCancellation(processDate : DateTime) {
    canScheduleCancellation().assertOkay()

    internalScheduleCancellation(processDate)
  }

  /**
   * Rechedules the cancellation to take place on the given processDate.  This will run through UW approval,
   * and if approved it will send notices and then start the cancellation workflow.
   *
   * Just like scheduleCancellation except with slightly different checks
   *
   * @param processDate the date on which cancellation takes place
   */
  function rescheduleCancellation(processDate : DateTime) {
    canRescheduleCancellation().assertOkay()

    internalScheduleCancellation(processDate)
  }

  private function internalScheduleCancellation(processDate : DateTime) {
    startScheduledCancellation(processDate)
    sendNotices()
  }

  /**
   * Checks the conditions for which the cancellation can be scheduled and immediately bound.
   */
  function canImmediatelyScheduleCancellation() : JobConditions {
    var jobConditions = canIssue("schedule immediate cancellation")

    addScheduleCancellationChecks(jobConditions)
    // If the cancellation is already scheduled we assume the notifications have already have been sent
    if (_branch.Status != TC_CANCELING) {
      addNotificationChecks(jobConditions)
    }

    return jobConditions
  }

  /**
   * Like scheduleCancellation, except that the cancellation will be completed
   * synchronously rather than using a workflow.
   */
  function cancelImmediately() {
    canImmediatelyScheduleCancellation().assertOkay()

    startScheduledCancellation(DateTime.CurrentDate)
    if (CurrentNotificationsSent) {
      removeCancellationWorkflow()
      issueCancellation()
    } else {
      sendNotices()
    }
  }

  private function startScheduledCancellation(processDate : DateTime) {
    // We want to throw here instead of disabling the buttons so that the end user gets visible feedback
   JobProcessValidator.validateCancellationDateNotTooSoon(_branch, Job)

    if (InitialNotificationsHaveBeenSent) {
      Job.createCustomHistoryEvent(CustomHistoryType.TC_CANCEL_RESCHEDULE, \ -> displaykey.Job.Cancellation.History.Reschedule(processDate))
    }

    JobProcessLogger.logInfo("Scheduling cancellation on ${_branch.EditEffectiveDate} for branch \"${_branch}\"")
    _branch.cancel(_branch.EditEffectiveDate)

    _branch.Status = TC_CANCELING
    Job.CancelProcessDate = processDate
  }

  /**
   * Puts the policy period into "Canceling" status, sets the CancelProcessDate of the job
   * and sends cancellation notices.
   */
  private function sendNotices() {
    if (CurrentNotificationsSent) {
      JobProcessLogger.logInfo("No new notices needed for cancellation on ${Job.NotificationDate} already sent for branch \"${_branch}\"")
    } else if (InitialNotificationsHaveBeenSent) {
      sendReplacementNotices()
    } else {
      sendInitialNotices()
    }
    // For asynchronous integration, do not call finishSendNotices().  It will be called from a different path
    // when the external system finishes.  Also see sendIntiialNotices() and sendReplacementNotices().
    finishSendNotices()
  }

  /**
   * Notify an external system to send the initial cancellation notices.
   */
  protected function sendInitialNotices() {
    Job.LastNotifiedCancellationDate = _branch.CancellationDate
    var currentDate = DateTime.CurrentDate
    Job.InitialNotificationDate  = currentDate
    Job.NotificationDate         = currentDate
    JobProcessLogger.logInfo("Sending notice of cancellation on ${Job.NotificationDate} for branch \"${_branch}\"")
    // For asynchronous integration, add the "SendCancellationNotices" event.  The event rules should create
    // a message for a MessageTransport to send to an external system.  When the external  system finishes
    // sending the notices, it should advance the CancellationProcess by calling the finishSendNotices() method.
    //_branch.addEvent("SendCancellationNotices")
  }

  /**
   * Notify an external system to send replacement cancellation notices.  This should only be called if
   * cancellation notices were already sent, and the cancellation has been rescheduled to a different date.
   */
  protected function sendReplacementNotices() {
    Job.LastNotifiedCancellationDate = _branch.CancellationDate
    Job.NotificationDate         = DateTime.CurrentDate
    JobProcessLogger.logInfo("Sending replacement notice of cancellation on ${Job.NotificationDate} for branch \"${_branch}\"")
    // For asynchronous integration, add the "SendReplacementCancellationNotices" event.  The event rules should create
    // a message for a MessageTransport to send to an external system.  When the external  system finishes
    // sending the notices, it should advance the CancellationProcess by calling the finishSendNotices() method.
    //_branch.addEvent("SendReplacementCancellationNotices")
  }

  /**
   * Checks the conditions to finish sending cancellation notices.
   */
  function canFinishSendNotices() : JobConditions {
    return startChecksFor("finish sending notices")
            .checkBranchNotLocked()
            .checkQuoteIsValid()
            .checkCurrentNotificationsSent()
            .checkNotNull(Job.CancelProcessDate, "Cancel process date is not set")
  }

  /**
   * Finish sending cancellation notices and start the CompleteCancellation workflow if
   * the CancelProcessDate is before or equal to today.
   */
  function finishSendNotices() {
    canFinishSendNotices().assertOkay()

    JobProcessLogger.logInfo("Finished sending notices for cancellation for branch \"${_branch}\"")
    Job.NotificationAckDate = DateTime.CurrentDate

    if (Job.CancelProcessDate <= DateTime.CurrentDate) {
      issueCancellation()
    } else {
      _branch.startWorkflow(TC_COMPLETECANCELLATIONWF)
    }
  }

  function canRescind() : JobConditions {
    return this.canRescind(false) 
  }


  /**
   * Checks the conditions for which the cancellation can be rescinded.
   */
  function canRescind(ignoreCancelProcessDate : boolean) : JobConditions {

        return startChecksFor("rescind")
            .checkPermission(Permissions.RescindCancellation)
            .checkBranchNotLocked()
            .checkQuoteIsValid()
            .checkCurrentNotificationsSent()
            .check(Job.RescindNotificationDate == null, "Rescind notification date is already set")
            .check(ignoreCancelProcessDate or (Job.CancelProcessDate > DateTime.CurrentDate), "Only available while pending")
  
  }



  /**
   * Rescinds the cancellation.  Invoke {@link #finishRescind} to finalize.
   */
  function rescind() {
    canRescind(false).assertOkay()
    JobProcessLogger.logInfo("Rescinding cancellation for branch \"${_branch}\"")
    Job.RescindNotificationDate = DateTime.CurrentDate
    _branch.Status = TC_RESCINDING
    finishRescind()
  }

  /**
   * Checks the conditions for which the cancellation rescind can be finished.
   */
  function canFinishRescind() : JobConditions {
    return startChecksFor("finish rescind")
            .checkPermission(Permissions.RescindCancellation)
            .checkBranchNotLocked()
            .checkQuoteIsValid()
            .checkCurrentNotificationsSent()
            .checkStatus(TC_RESCINDING)
  }

  /**
   * Finishes rescinding the cancellation.
   */
  function finishRescind() {
    canFinishRescind().assertOkay()
    JobProcessLogger.logInfo("Finished rescinding cancellation for branch \"${_branch}\"")
    _branch.Status = TC_RESCINDED
    _branch.lockBranch()
  }

  /**
   * Checks the conditions for which the cancellation can be issued.
   */
  function canIssueCancellation() : JobConditions {
    return startChecksFor("issue cancellation")
            .checkBranchNotLocked()
            .checkQuoteIsValid()
            .checkCurrentNotificationsSent()
            .checkNoUnhandledPreemptions()
            .check(Job.CancelProcessDate <= DateTime.CurrentDate, "Only available after cancel process date")
            .checkNoFutureTermsArchived()
  }

  /**
   * Issues the cancellation.  Don't do AccountSyncable validation.
   * 
   */
  function issueCancellation() {
    canIssueCancellation().assertOkay()
    JobProcessLogger.logInfo("Binding cancellation for branch \"${_branch}\"")
    _branch.ensureProducerOfService()
    FormInferenceEngine.Instance.inferPreBindForms(_branch)
    finishCancellation()

    // push to future depends on commit of branch promotion...
    withdrawOrCancelRenewalInFuturePeriod()
  }

  function issueCancellationFromWorkflow() {
    try{

      // Do not issue cancellation if this cancellation has already been withdrawn or rescinded by a prior cancellation
      if( _branch.Status == TC_WITHDRAWN){
         JobProcessLogger.logInfo("Not issuing withdrawn or rescinded cancellation for branch \"${_branch}\"")
         return;
      }
      
      issueCancellation()
      
    } catch(e : JobStateException) {
      escalate(displaykey.Job.Cancellation.Escalation.CannotCancel(_branch.PolicyNumber), e.Message)
    }
  }

  /**
   * Checks the conditions for which the cancellation can be finished.
   */
  function canFinishCancellation() : JobConditions {
    return canFinishJob("finish cancellation")
            .checkStatus(TC_CANCELING)
  }

  /**
   * Finishes cancellation.
   */
  function finishCancellation() {
    canFinishCancellation().assertOkay()
    JobProcessLogger.logInfo("Finish binding cancellation for branch \"${_branch}\"")
    prepareBranchForFinishingJob()
    _branch.Job.copyUsersFromJobToPolicy()
    processAudits()

    // For flat cancellation reporting policies, deposit released is set to true, and deposit will
    // be set to 0 when sent to the billing system.  For non flat cancellation in WC reporting
    // policies, deposit release is false, and deposit from the orignal basedon is sent to the
    // billing system.  See calculateDeposit() in PolicyInfoExt for more information.

    if (_branch.CancellationDate == _branch.PeriodStart and _branch.IsReportingPolicy) {
      _branch.DepositAmount = MonetaryAmounts.zeroOf(_branch.PreferredSettlementCurrency)
      _branch.PolicyTerm.DepositReleased = true
      _branch.PolicyTerm.DepositAmount = MonetaryAmounts.zeroOf(_branch.PreferredSettlementCurrency)
    }

    _branch.updateTrendAnalysisValues()
    withdrawOtherCancellations()
    createBillingEventMessages()
    if (Job.CancelReasonCode == TC_FLATREWRITE) {
      Job.createRoleActivity(TC_UNDERWRITER,
                             ActivityPattern.finder.getActivityPatternByCode("notification"),
                             displaykey.Job.Cancellation.RenewalToBeRewritten(_branch.PolicyNumber),
                             displaykey.Job.Cancellation.RenewalToBeRewritten.Description)
    }
    // run this before promote branch because it more likely to fail
    bindReinsurableRisks() // flags Activity on error...

    _branch.promoteBranch(true)
    commitBranch("finish cancellation")
  }

  protected override function processSpecificPreemptionHandling(newBranch : PolicyPeriod) {
    newBranch.Cancellation.CancelProcessDate = null
    removeCancellationWorkflow()
  }

  override function initializeFuturePeriodJob(futureJob : Job) {
    var futureCancellation = futureJob as Cancellation
    futureCancellation.Source = this.Job.Source
    futureCancellation.CancelReasonCode = this.Job.CancelReasonCode
    futureCancellation.PolicyPeriod.RefundCalcMethod = this.Job.PolicyPeriod.RefundCalcMethod
  }

  override function canWithdraw() : JobConditions {
    return super.canWithdraw()
            .checkCondition(!InitialNotificationsHaveBeenSent, displaykey.Web.Cancellation.Error.NotificationsSent)
            .checkNull(Job.CancelProcessDate, "Cancellation has been processed")
  }

  override function withdrawWithoutCheckingConditions() {
    super.withdrawWithoutCheckingConditions()
    Job.NotificationDate = null
  }

  override function applyChangeToFutureRenewalAutomatic() : boolean {
    return true
  }

  override function canApplyChangesToFutureBoundRenewal() : boolean {
    return canApplyChangeToFutureRenewal(true)
  }

  override function canApplyChangesToFutureUnboundRenewal() : boolean {
    return canApplyChangeToFutureRenewal(false) and hasOpenRenewalToWithdraw()
  }

  override function applyChangesToFutureBoundRenewal() : ApplyChangesResult[] {
    var futureBranch = Job.createFutureJob(_branch.FutureRenewals.first()).LatestPeriod
    _branch.clearResolveWithFuturePeriods()
    futureBranch.CancellationProcess.start()
    _branch.Bundle.commit()
    return { new ApplyChangesResult(futureBranch, new ArrayList<DiffItem>(), _branch.EditEffectiveDate) }
  }

  override function applyChangesToFutureUnboundRenewal() : ApplyChangesResult[] {
    var futureBranch = _branch.FutureRenewals.first()
    _branch.clearResolveWithFuturePeriods()
    _branch.Policy.OpenRenewalJob.withdrawOrSetNonRenewal()
    _branch.Bundle.commit()
    return { new ApplyChangesResult(futureBranch, new ArrayList<DiffItem>(), _branch.EditEffectiveDate) }
  }

  override function createBillingEventMessages() {
    _branch.addEvent(BillingMessageTransport.CANCELPERIOD_MSG)
  }

  function hasOpenRenewalToWithdraw() : boolean {
    var renewalJob = _branch.Policy.OpenRenewalJob
    var renewal = renewalJob.ActivePeriods[0].RenewalProcess
    return (renewal != null)
  }

  function hasBoundRenewalToCancel() : boolean {
    return hasFutureRenewals(true)
  }

  private function processAudits() {
    if (_branch.IsAuditable) {
      _branch.withdrawOpenRevisedFinalAudit()
      _branch.reverseFinalAudits()
      var hasScheduledFinalAudit = _branch.hasScheduledFinalAudit()
      _branch.removeScheduledFinalAudit()
      if (_branch.CancellationDate == _branch.PeriodStart) {
        _branch.cancelPremiumReports()
        _branch.withdrawOpenFinalAudit()
        _branch.addEvent(BillingMessageTransport.WAIVEFINALAUDIT_MSG)
      } else if (_branch.hasOpenFinalAudit()) {
        _branch.updateAuditPeriodEndDatesFollowingCancellation()
        _branch.rescheduleAuditSeries()
        _branch.createActivitiesTriggeredByCancellation()
      } else if (hasScheduledFinalAudit or not _branch.hasWaivedFinalAudit()) {
        _branch.rescheduleAuditSeries()
        _branch.scheduleCancellationFinalAudit()
      }
    }
  }

  private function withdrawOtherCancellations() {
    var otherCancellations = _branch.Policy.OpenJobs.whereTypeIs(Cancellation)
    for (cancellation in otherCancellations) {
      var cancellationProcess = cancellation.PolicyPeriod.CancellationProcess
      JobProcessLogger.logInfo("Withdrawing pre-empted cancellation #${cancellation.JobNumber}")
      if (cancellationProcess.canWithdrawJob().Okay) {
        cancellationProcess.withdrawJob()
      } else if ( cancellationProcess.canRescind(true).Okay) {   
        // try to withdraw the completed cancellation
        cancellationProcess.withdrawWithoutCheckingConditions()
        
      }
    }
  }

  private function withdrawOrCancelRenewalInFuturePeriod() {
    if (_branch.ResolveWithFuturePeriods) {
      if (canApplyChangesToFutureBoundRenewal()) {
        var apply = applyChangesToFutureBoundRenewal()
        var renewal = apply*.Branch[0]
        Job.createRoleActivity(TC_UNDERWRITER, ActivityPattern.finder.getActivityPatternByCode("notification"),
          displaykey.Cancellation.FuturePeriod.Cancel.Subject(renewal.PolicyNumber),
          displaykey.Cancellation.FuturePeriod.Cancel.Description(renewal.Job.JobNumber, renewal.PolicyNumber))
      } else if (canApplyChangesToFutureUnboundRenewal()) {
        var apply = applyChangesToFutureUnboundRenewal()
        var renewal = apply*.Branch[0]
        // create and activity to notify about the new status of the withdrawal
        if(renewal.Status == PolicyPeriodStatus.TC_WITHDRAWN) {
          Job.createRoleActivity(TC_UNDERWRITER, ActivityPattern.finder.getActivityPatternByCode("notification"),
            displaykey.Cancellation.FuturePeriod.Withdraw.Subject(renewal.PolicyNumber),
            displaykey.Cancellation.FuturePeriod.Withdraw.Description(renewal.Job.JobNumber, renewal.PolicyNumber))
        } else if(renewal.Status == PolicyPeriodStatus.TC_NONRENEWING) {
          Job.createRoleActivity(TC_UNDERWRITER, ActivityPattern.finder.getActivityPatternByCode("notification"),
              displaykey.Cancellation.FuturePeriod.NonRenewing.Subject(renewal.PolicyNumber),
              displaykey.Cancellation.FuturePeriod.NonRenewing.Description(renewal.Job.JobNumber, renewal.PolicyNumber))
        } else {
          throw new IllegalStateException("Unexpected renewal status: ${renewal.Status}")
        }
      }
    }
  }

  override function issueJob(bindAndIssue : boolean) {
    throw new UnsupportedOperationException("Cannot issueJob for CancellationProcess")
  }

  // ---------------------------------------------------------- Job escalation

  /**
   * Checks the conditions for escalating the job.
   */
  function canEscalate() : JobConditions {
    return startChecksFor("job escalation")
            .checkBranchNotLocked()
  }

  /**
   * Escalates the job.
   */
  function escalate(subject : String, description : String) {
    canEscalate().assertOkay()
    JobProcessLogger.logInfo("Escalating cancellation branch: ${_branch}")
    Job.createRoleActivity(TC_UNDERWRITER,
      ActivityPattern.finder.getActivityPatternByCode("notification"),
      subject, description)
  }

  private class EscalationReasonChecker {
    private var _messages = new ArrayList<String>()
    private var _state : PolicyPeriodStatus

    construct(state : PolicyPeriodStatus) {
      _state = state
    }

    function checkForUnhandledPreemptions() : EscalationReasonChecker {
      if (_branch.hasAnyUnhandledPreemptions()) {
        _messages.add(displaykey.Job.Cancellation.Escalation.Reason.UnhandledPreemptions)
      }
      return this
    }
  }
}
