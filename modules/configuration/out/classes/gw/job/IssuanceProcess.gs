package gw.job

uses gw.api.job.JobProcessLogger
uses gw.forms.FormInferenceEngine
uses gw.job.permissions.IssuancePermissions
uses gw.plugin.messaging.BillingMessageTransport
uses java.lang.IllegalArgumentException
uses java.util.Date

/**
 * Encapsulates the actions taken within an Issuance Job.
 *
 * @see JobProcess for general information and job process logic.
 * @see gw.plugin.policyperiod.impl.JobProcessCreationPlugin
 */
@Export
class IssuanceProcess extends JobProcess {

  construct(period : PolicyPeriod) {
    super(period, new IssuancePermissions(period.Job))
    JobProcessEvaluator = JobProcessUWIssueEvaluator.forIssuance()
  }

  override property get Job() : Issuance {
    return super.Job as Issuance
  }

  // ===== LIFECYCLE FUNCTIONS =====

  /**
   * Initializes the issuance job.
   */
  override function start() {
    JobProcessLogger.logInfo("Starting issuance for branch: " + _branch)
    startJobAsNew()
    if (Job.ActivePeriods.Count == 1) {
      // logic for new issuance
      Job.assignRolesFromPolicy()
      _branch.expireNextChangeApprovals()
      _branch.expirePastDateApprovals()
    }
    beginEditing()
  }

  override function beginEditing() {
    super.beginEditing()
    _branch.Lines.each(\l -> l.onIssuanceBeginEditing())
  }

  /**
   * Indicates whether issuance can be saved -- yes, it always can.
   */
  function canSaveDraft(): boolean  {
    return true
  }

  /**
   * Checks the conditions for which the policy period can be quoted.
   */
  override function canRequestQuote() : JobConditions {
    return super.canRequestQuote()
            .checkDraft()
  }

  /**
   * Checks the conditions for which we can start the process of issuing the policy period.
   */
  override function canIssue(operation : String) : JobConditions {
    return canFinishIssue(super.canIssue(operation))
  }

  /**
   * Starts issuance for the policy period.  Complete issuance by invoking
   * {@link #finishIssuing} or {@link #failIssuing}.
   */
  function finishIssuing() {
    canIssue("finish issuing")
      .checkJobNotComplete()
      .assertOkay()

    JobProcessLogger.logInfo("Finish issuing branch: " + _branch)
    prepareBranchForFinishingJob()
    _branch.Job.copyUsersFromJobToPolicy()
    createBillingEventMessages()
    if (_branch.hasScheduledFinalAudit()) {
      if (_branch.PeriodStart != _branch.BasedOn.PeriodStart or _branch.PeriodEnd != _branch.BasedOn.PeriodEnd) {
        _branch.removeScheduledFinalAudit()
        _branch.scheduleExpirationFinalAudit()
      }
    }
    _branch.rescheduleAuditSeries()
    _branch.Policy.markIssued(Date.Today)
    _branch.Policy.OriginalEffectiveDate = _branch.PeriodStart
    _branch.updatePolicyTermDepositAmount()
    startChecksFor("issuing").checkNoActivePeriods().assertOkay()

    _branch.promoteBranch(false)
    commitBranch("promote in issue")

    bindReinsurableRisks() // flags Activity on error...
    commitBranch("bind reinsurables in issue")

    JobProcessLogger.logDebug("Finished issuing branch: " + _branch)
  }

  /**
   * Starts issuance for the policy period.  Complete issuance by invoking
   * {@link #finishIssuing} or {@link #failIssuing}.
   */
  function issue() {
    canIssue().assertOkay()
    JobProcessValidator.validatePeriodForUI(_branch, TC_READYFORISSUE)
    JobProcessEvaluator.evaluateAndCheckForBlockingUWIssues(_branch, TC_BLOCKSISSUANCE)

    // Do AccountSyncable validation here. 
    _branch.AllAccountSyncables.each(\ a -> a.prepareForPromote())

    JobProcessLogger.logDebug("Issue branch: " + _branch)
    withdrawOtherActivePeriods()
    FormInferenceEngine.Instance.inferPreBindForms(_branch)
    _branch.Status = TC_BINDING

    _branch.bindAutoNumberSequences()
    _branch.runSubmissionIssuanceLogic()

    // To make cancellation asynchronous, uncomment this event and remove the call to finishIssuing.
    // Whatever responds to the event needs to call finishIssuing() when it has finished so that
    // PolicyCenter can finish the process.

    //_branch.addEvent("IssueSubmission")
    finishIssuing()
  }

  override property get RecalculateDepositOnReportingAfterValidQuote() : boolean {
    return true
  }

  /**
   * Successfully completes issuance of a policy period.
   */
  override function createBillingEventMessages() {
    _branch.addEvent(BillingMessageTransport.ISSUEPERIOD_MSG)
  }

  /**
   * Fails issuance of policy period, set the status to "Review".
   */
  function failIssuing() {
    startChecksFor("fail issuing").checkBranchNotLocked().assertOkay()
    Job.assignUnderwriter()
    Job.createProducerActivity(ActivityPattern.finder.getActivityPatternByCode("issue_failed"),
                                displaykey.Issuance.IssuePolicy.Failed.Subject,
                                displaykey.Issuance.IssuePolicy.Failed.Description)
  }

  /**
   * Check the conditions for which this policy period can be withdrawn.
   */
  override function canWithdraw() : JobConditions {
    return super.canWithdraw()
            .checkStatus(new PolicyPeriodStatus[] { TC_NEW, TC_DRAFT, TC_QUOTED })
  }

  /**
   * Checks the conditions for which a search for data to copy into the policy can be started
   */
  override function canStartCopyPolicyData() : JobConditions {
    return internalCanStartCopyPolicyData()
  }

  override function issueJob(bindAndIssue : boolean) {
    if (not bindAndIssue) {
      throw new IllegalArgumentException("Bind-only not allowed for Issuance")
    }
    issue()
  }
}
