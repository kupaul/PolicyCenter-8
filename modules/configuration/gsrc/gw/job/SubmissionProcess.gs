package gw.job

uses gw.api.profiler.PCProfilerTag
uses gw.api.job.JobProcessLogger
uses gw.forms.FormInferenceEngine
uses gw.job.permissions.SubmissionPermissions
uses gw.plugin.messaging.BillingMessageTransport

uses java.util.Date

/**
 * Encapsulates the actions taken within a Submission job.
 *
 * @see JobProcess for general information and job process logic.
 * @see gw.plugin.policyperiod.impl.JobProcessCreationPlugin
 */
@Export
class SubmissionProcess extends NewTermProcess {

  construct(period : PolicyPeriod) {
    super(period, new SubmissionPermissions(period.Job))
    JobProcessEvaluator = JobProcessUWIssueEvaluator.forSubmission()
  }

  override property get Job() : Submission {
    return super.Job as Submission
  }

  // ===== LIFECYCLE FUNCTIONS =====

  /**
   * Initializes a new submission.
   */
  override function start() {
    JobProcessLogger.logInfo("Starting submission, branch: " + _branch)
    startJobAsNew()
    _branch.Policy.PriorPremiums = 0bd.ofCurrency(_branch.PreferredSettlementCurrency)
    // go straight to editing when starting a new version on an existing Submission (for multiquote)
    if (Job.ActivePeriods.Count > 1) {
      beginEditing()
      return
    }

    // assign team members at this point so that automatic assignments will work
    Job.assignProducer()
    Job.assignUnderwriter()

    // make a history record that submission was created;
    // the block is used to evaluate the display key for the message
    Job.createCustomHistoryEvent("sub_created", \ -> displaykey.Submission.History.JobCreated)
    Job.addToGroup()
    _branch.Policy.Account.makeActive()
  }

  /**
   * Moves a policy from "New" to "Draft" status.
   */
  override function beginEditing() {
    super.beginEditing()
    _branch.Lines.each(\l -> l.onSubmissionBeginEditing())

    // fill in the empty territory codes
    for (territotyCode in _branch.PrimaryLocation.TerritoryCodes) {
      if (territotyCode.Code == null) {
        territotyCode.fillWithFirst()
      }
    }
  }

  /**
   * Checks the conditions for which the policy period can be saved.
   */
  function canSaveDraft() : JobConditions {
    return startChecksFor("save draft")
  }

  /**
   * Checks the conditions for which the policy period can be quoted.
   */
  override function canRequestQuote() : JobConditions {
    return super.canRequestQuote()
            .checkDraft()
  }

  /**
   * Checks the conditions for which a new version of the policy period can be created.
   */
  override function canMakeNewVersion(): JobConditions {
    return super.canMakeNewVersion()
            .checkJobNotComplete()
  }

  /**
   * Checks the conditions for which a search for data to copy into the policy can be started
   */
  override function canStartCopyPolicyData() : JobConditions {
    return internalCanStartCopyPolicyData()
  }

  /**
   * Checks the conditions for which the submission can be switched from being a
   * "Quick Quote" to a "Full Application" for a policy.
   */
  function canConvertToFullApp() : JobConditions {
    return startChecksFor("convert to full application")
            .checkEditPermission()
            .checkQuickQuote()
            .checkNoBranchLocked()
            .checkNotStatus({PolicyPeriodStatus.TC_DECLINED, PolicyPeriodStatus.TC_NOTTAKEN})
  }

  /**
   * Converts the submission from a "Quick Quote" to a "Full Application".
   * Also invalidates (but preserves) existing quotes on the policy period.
   * Make calling period selected version.
   */
  function convertToFullApp() {
    canConvertToFullApp().assertOkay()
    Job.QuoteType = TC_FULL
    Job.ActivePeriods.each(\ pp -> pp.editIfQuoted())
  }

  /**
   * Checks the conditions for which the policy period can be bound.
   */
  override function canBind() : JobConditions {
    return canFinishBind(super.canBind())
            .checkFullApp()
  }

  /**
   * Binds the branch without issuing or billing for the policy.
   */
  function bindOnly() {
    Job.BindOption = TC_BINDONLY
    bind()
  }

  /**
   * Gets the job specific activity pattern for UW review activity
   *
   * @see ActivityPatternEnhancement
   */
  override protected property get UWReviewActivityPattern() : ActivityPattern {
    return ActivityPattern.finder.getActivityPatternByCode("approve_submission")
  }

  /**
   * Binds the branch and issues the policy.
   */
  function issue() {
    Job.BindOption = TC_BINDANDISSUE
    bind()
  }

  /**
   * Begins the bind process for the branch.  As a result, the policy period may be rejected
   * and declined, marked for review by an underwriter, or returned to draft for user edits.  If
   * successful, binding is started.
   *
   * To complete binding, call {@link finishBinding}.
   */
  override function bind() {
    PCProfilerTag.BIND_CHECK_CAN_BIND.execute(\ -> canBind().assertOkay())
    JobProcessLogger.logInfo("Attempting to bind branch: " + _branch)

    // Validate. If anything fails validation, throw an exception
    var alsoTryingToIssue = Job.BindOption == TC_BINDANDISSUE
    var validationLevel: ValidationLevel = alsoTryingToIssue ? TC_READYFORISSUE : TC_BINDABLE
    var blockingPoint : UWIssueBlockingPoint = alsoTryingToIssue ? TC_BLOCKSISSUANCE : TC_BLOCKSBIND

    PCProfilerTag.BIND_VALIDATE.execute(\ -> JobProcessValidator.validatePeriodForUI(_branch, validationLevel))
    PCProfilerTag.BIND_CHECK_UW_ISSUES.execute(\ -> JobProcessEvaluator.evaluateAndCheckForBlockingUWIssues(_branch, blockingPoint))

    // Do AccountSyncable validation
    PCProfilerTag.BIND_PREPARE_ACCOUNT_SYNCABLES.execute(\ -> _branch.AllAccountSyncables.each(\ a -> a.prepareForPromote()))

    // Continue processing since nothing has gone wrong
    startBinding()
  }

  /**
   * Completes the binding of a PolicyPeriod without issuing it. This marks
   * the PolicyPeriod as bound and completes the job. If issuance is being held,
   * the branch will be promoted to the main PolicyPeriod. Branches with no hold
   * status must go through {@link #finishIssuing} to be promoted to the PolicyPeriod.
   */
  function finishBinding() {
    PCProfilerTag.BIND_CHECK_CAN_FINISH.execute(\ -> {
      canFinishBind()
        .checkOnlyActivePeriod()
        .checkBranchNotLocked()
        .assertOkay()
    })
    JobProcessLogger.logInfo("Finish binding branch: " + _branch)

    PCProfilerTag.BIND_FINISH.execute(\ -> {
      _branch.PolicyTerm.Bound = true
      Job.Policy.Account.markContactsForAutoSync()
      Job.copyUsersFromJobToPolicy()
      Job.createCustomHistoryEvent(TC_SUB_BOUND, \ -> displaykey.Submission.History.JobBound)
      _branch.Policy.OriginalEffectiveDate = _branch.PeriodStart
      if (Job.BindOption == "BindAndIssue") {
        PCProfilerTag.BIND_INFER_FORMS.execute(\ -> FormInferenceEngine.Instance.inferPreBindForms(_branch))
        PCProfilerTag.BIND_FINISH_ISSUANCE.execute(\ -> {
          _branch.Status = "Binding"
          _branch.bindAutoNumberSequences()
          _branch.runSubmissionIssuanceLogic()

          // To make this work asynchronously, uncomment the call to add an event
          // and remove the call to finishIssuing() below.  Whatever responds to the
          // event must invoke finishIssuing() so that PolicyCenter can complete the
          // binding process.

          //_branch.addEvent("IssueSubmission")
          finishIssuing()
        })
      } else {
        PCProfilerTag.BIND_HOLD_ISSUANCE.execute(\ -> {
          _branch.renumberAutoNumberSequences()
          // If we're holding issuance, then remove all forms before promotion so
          // that the issuance job will re-generate them all from scratch
          _branch.removeAllNewlyAddedForms()
          finalizeBeforeIssuing()

          startChecksFor("finish binding").checkNoActivePeriods().assertOkay()

          finalizeBindIssue()

          JobProcessLogger.logInfo("Finish binding branch: " + _branch)
        })
      }
      commitBranch("finish binding submission")
    })
  }

  /**
   * Marks the branch for review by an underwriter. Call this when binding fails.
   */
  function failBinding() {
    canFailBind().assertOkay()
    JobProcessLogger.logInfo("Fail binding branch: " + _branch)
    Job.createProducerActivity(ActivityPattern.finder.getActivityPatternByCode("bind_failed"),
                               displaykey.Submission.BindSubmission.Failed.Activity.Subject,
                               displaykey.Submission.BindSubmission.Failed.Activity.Description)
    Job.autoAssignRole(TC_UNDERWRITER)
  }

  /**
   * Checks the conditions for which the policy period can be issued.
   * This set of conditions is the same as .canBind(), except for the
   *     security permission.
   */
  override function canIssue() : JobConditions {
    return super.canIssue()
            .checkFullApp()
  }

  /**
   * Successfully complete issuance of a PolicyPeriod by marking the PolicyPeriod as "Bound"
   * and completing the job.
   */
  function finishIssuing() {
    canFinishIssue(canIssue("finish issuing"))
      .checkJobNotComplete()
      .assertOkay()

    finalizeBeforeIssuing()

    _branch.Policy.markIssued(Date.Today)

    startChecksFor("finish issuing").checkNoActivePeriods().assertOkay()

    finalizeBindIssue()

    JobProcessLogger.logInfo("Finish issuing branch: " + _branch)
    commitBranch("finish issuing submission")
  }

  override property get RecalculateDepositOnReportingAfterValidQuote() : boolean {
    return true
  }

  override function createBillingEventMessages() {
    _branch.addEvent(BillingMessageTransport.CREATEPERIOD_MSG)
  }

  /**
   * Sets the status of <code>PolicyPeriod</code> to review, to be called when issuing fails.
   */
  function failIssuing() {
    canFailIssue().assertOkay()
    JobProcessLogger.logInfo("Fail issuing branch: " + _branch)
    Job.createProducerActivity(ActivityPattern.finder.getActivityPatternByCode("issue_failed"),
                               displaykey.Submission.IssuePolicy.Failed.Activity.Subject,
                               displaykey.Submission.IssuePolicy.Failed.Activity.Description)
    Job.autoAssignRole(TC_UNDERWRITER)
  }


  // ===== TERMINAL FUNCTIONS =====

  /**
   * Indicates whether this submission can be declined by the insurer. Decline may not be allowed due
   * to a number of factors, including lack of permission or  currect status of one or
   * more active branches on the submission.
   */
  function canDeclineJob() : JobConditions {
    var conditions = startChecksFor("decline job")
                      .checkPermission(Permissions.Decline)
                      .checkJobNotComplete()

    // all branches on job must be able to be declined
    Job.ActivePeriods.each(\ branch -> conditions.append(branch.SubmissionProcess.canDecline()))
    return conditions
  }

  /**
   * Indicates whether a period can be declined by the insured.
   */
  function canDecline() : JobConditions {
    return startChecksFor("decline")
            .checkPermission(Permissions.Decline)
            .checkNotPromoted()
  }

  /**
   * Declines all active policy periods in the job, and sets the selected version of the job to
   * the branch from which the decline was started.
   */
  function declineJob() {
    canDeclineJob().assertOkay()
    this.cancelOpenActivities()
    // decline all branches, bypassing check of conditions since we just did that
    Job.ActivePeriods.each(\ branch -> branch.SubmissionProcess.declineWithoutCheckingConditions())
    Job.SelectedVersion = _branch
  }

  /**
   * Declines this policy period, resetting the selected version of the job if needed.
   */
  function decline() {
    canDecline().assertOkay()
    declineWithoutCheckingConditions()
  }

  private function declineWithoutCheckingConditions() {
    lockBranchWithStatus(TC_DECLINED)
  }

  /**
   * Checks the conditions for which the Job can be rejected by the insured (i.e., "not taken").
   */
  function canNotTakeJob() : JobConditions {
    var conditions = startChecksFor("not take job")
                      .checkPermission(Permissions.NotTaken)
                      .checkJobNotComplete()

    // all branches on job must be able to be not taken
    Job.ActivePeriods.each(\ branch -> conditions.append(branch.SubmissionProcess.canNotTake()))
    return conditions
  }

  /**
   * Indicates whether a branch can be not taken.
   */
  function canNotTake() : JobConditions {
    return startChecksFor("not take")
        .checkPermission(Permissions.NotTaken)
        .checkBranchNotLocked()
        .checkNotPromoted()
  }

  /**
   * Not takes all active policy periods in the job, and sets the selected version of the job to
   * the branch from which the not taken was started.
   */
  function notTakeJob() {
    canNotTakeJob().assertOkay()
    this.cancelOpenActivities()
    Job.ActivePeriods.each(\ branch -> branch.SubmissionProcess.notTakeWithoutCheckingConditions())
    Job.SelectedVersion = _branch
  }

  /**
   * Not takes this policy period, resetting the selected version of the job if needed.
   */
  function notTake() {
    canNotTake().assertOkay()
    notTakeWithoutCheckingConditions()
  }

  // useful to eliminate redundant checks because notTakeJob already check canNotTake for each of the branches
  private function notTakeWithoutCheckingConditions() {
    lockBranchWithStatus(TC_NOTTAKEN)
  }

  /**
   * Withdraws this Job and adds a notification message.
   */
  override function withdrawJob() {
    super.withdrawJob()
    Job.createProducerActivity(ActivityPattern.finder.getActivityPatternByCode("notification"),
                               displaykey.Submission.Withdrawn.Activity.Subject,
                               displaykey.Submission.Withdrawn.Activity.Description)
  }

  function beforePeriodStartChanged(newValue : Date){
    _branch.Lines.each(\ line -> line.prePeriodStartChanged(newValue))
  }

  private function startBinding() {
    JobProcessLogger.logInfo("Binding branch: " + _branch)

    PCProfilerTag.BIND_START.execute(\ -> {
      // only bind one period (matters in the case of multiquote)
      withdrawOtherActivePeriods()
      _branch.updateTermNumber()
      _branch.PolicyNumber = _branch.genNewPeriodPolicyNumber()

    if (Job.BindOption != TC_BINDANDISSUE) {
      Job.createRoleActivity(TC_UNDERWRITER, ActivityPattern.finder.getActivityPatternByCode("issue_policy"),
                             displaykey.Submission.NotIssued.Activity.Subject,
                             displaykey.Submission.NotIssued.Activity.Description)
    }

      _branch.Status = TC_BINDING
      _branch.properlySetTransactionFlags()
    })

    // To make this work asynchronously, uncomment the call to add an event
    // and remove the call to finishBinding() below.  Whatever responds to the
    // event must invoke finishBinding() so that PolicyCenter can complete the
    // binding process.

    //_branch.addEvent("BindSubmission")
    finishBinding()
  }

  // These tests depend on the commit ordering in the finalization
  // methods:  JobProcessTest, RenewalLossClaimsTest, PolicyImplTest,
  // UWIssueApprovalExpirationTest
  //
  private function finalizeBeforeIssuing() {
    prepareBranchForFinishingJob()
    createBillingEventMessages()
    _branch.scheduleAllAudits()
    _branch.updatePolicyTermDepositAmount()
  }

  private function finalizeBindIssue() {
    // run this before promoteBranch because it has more chance of failing
    bindReinsurableRisks() // flags Activity on error...

    _branch.promoteBranch(false)
  }

  override function issueJob(bindAndIssue : boolean) {
    _branch.onBeginIssueJob()
    if (bindAndIssue) {
      issue()
    } else {
      bindOnly()
    }
  }
}
