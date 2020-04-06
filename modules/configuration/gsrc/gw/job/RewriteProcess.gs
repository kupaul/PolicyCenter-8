package gw.job

uses gw.api.job.JobProcessLogger
uses gw.forms.FormInferenceEngine
uses gw.job.permissions.RewritePermissions
uses gw.plugin.messaging.BillingMessageTransport
uses java.lang.IllegalArgumentException
uses java.util.Date

/**
 * Encapsulates the actions taken within a Rewrite job.
 *
 * @see JobProcess for general information and job process logic.
 * @see gw.plugin.policyperiod.impl.JobProcessCreationPlugin
 */
@Export
class RewriteProcess extends NewTermProcess {

  construct(period : PolicyPeriod) {
    super(period, new RewritePermissions(period.Job))
    JobProcessEvaluator = JobProcessUWIssueEvaluator.forRewrite()
  }

  override property get Job() : Rewrite {
    return super.Job as Rewrite
  }

  // ===== LIFECYCLE FUNCTIONS =====

  /**
   * Initializes a rewrite.
   */
  override function start() {
    JobProcessLogger.logInfo("Starting rewrite for branch: " + _branch)
    startJobAsDraft()
    initializeProducers()
    _branch.cloneAutoNumberSequences()
    _branch.resetAutoNumberSequences()
    
    // Sync computed values as well as all coverages, modifiers, and questions
    _branch.syncComputedValues()
    _branch.syncOffering()
    _branch.syncQuestions()
    _branch.Lines*.AllCoverables.each(\ c -> c.createOrSyncCoverages())
    _branch.AllModifiables.each(\ m -> m.syncModifiers())
    _branch.Lines.each(\l -> l.syncQuestions())
    _branch.PolicyLocations.each(\pl -> pl.syncQuestions())

    Job.assignRolesFromPolicy()
    _branch.expireNextChangeApprovals()
    _branch.expireEndOfTermApprovals()
    _branch.expirePastDateApprovals()

    // make a history record that submission was created;
    // the block is used to evaluate the display key for the message
    Job.createCustomHistoryEvent(TC_REWRITE_CREATED, \ -> displaykey.Rewrite.History.JobCreated)
  }

  override function initializeProducers() {
    if (this.Job.RewriteType == TC_REWRITEFULLTERM) {
      var producerCode = Job.Policy.ProducerCodeOfService
      if (producerCode != null) {
        _branch.EffectiveDatedFields.ProducerCode = producerCode
        _branch.ProducerCodeOfRecord = producerCode
      }
    }
  }

  override protected property get DefaultWrittenDate() : Date {
    if (_branch.Rewrite.RewriteType == TC_REWRITENEWTERM) {
      // For a new term rewrite use the current date as the written date
      return Date.CurrentDate
    } else {
      // Else use the same written date as the submission/renewal/rewrite being rewritten
      return _branch.BasedOn.FirstPeriodInTerm.WrittenDate
    }
  }

  /**
   * Checks the conditions for which the policy period can be quoted.
   */
  override function canRequestQuote() : JobConditions {
    return super.canRequestQuote()
            .checkNoUnhandledPreemptions()
  }

  /**
   * Checks the conditions for which a search for data to copy into the policy can be started
   */
  override function canStartCopyPolicyData() : JobConditions {
    return internalCanStartCopyPolicyData()
  }

  /**
   * Checks the conditions for which the policy period can be rewritten.
   */
  function canRewrite() : JobConditions {
    return canFinishIssue(canIssue("rewrite"))
            .checkNotStatus(TC_BINDING)
  }

  /**
   * Rewrites the policy period.
   */
  function rewrite() {
    canRewrite().assertOkay()
    startBinding()
  }

  /**
   * Begins the binding process for the policy period, optionally bypassing validation.
   *
   * @param skipValidation  Bypasses validation logic if true
   */
  function startBinding() {
    JobProcessValidator.validatePeriodForUI(_branch, TC_READYFORISSUE)
    if (_branch.Job.OOSJob) {
      _validator.validateOOSESlices(_branch, TC_READYFORISSUE)
    }

    JobProcessEvaluator.evaluateAndCheckForBlockingUWIssues(_branch, TC_BLOCKSISSUANCE)

    // Do AccountSyncable validation here. 
    _branch.AllAccountSyncables.each(\ a -> a.prepareForPromote())
    
    withdrawOtherActivePeriods()
    if(Job.ChangePolicyNumber) {
      _branch.PolicyNumber = _branch.genNewPeriodPolicyNumber()
    }
    _branch.Status = TC_BINDING
    _branch.ensureProducerOfService()
    _branch.ensureProducerOfRecord()
    _branch.bindAutoNumberSequences()

    FormInferenceEngine.Instance.inferPreBindForms(_branch)

    // To make this work asynchronously, uncomment this event and remove the call to finishRewrite.
    // Whatever responds to the event needs to call finishRewrite() and commit() when it has finished so that
    // PolicyCenter can finish the process.

    //_branch.addEvent("IssueRewrite")
    finishRewrite()
    commitBranch("finish rewrite")
  }

  /**
   * Finishes the rewrite for the policy period.
   */
  function finishRewrite() {
    JobProcessLogger.logInfo("Finishing rewrite for branch: " + _branch)
    canFinishJob("finish rewrite")
        .checkJobNotComplete()
        .checkOnlyActivePeriod()
        .assertOkay()
    _branch.properlySetTransactionFlags()
    createBillingEventMessages()
    _branch.Job.copyUsersFromJobToPolicy()
    prepareBranchForFinishingJob()
    handleFinalAudit()
    _branch.BasedOn.clearOutstandingCancellationsOrReinstatementsInSamePeriod()
    _branch.updatePolicyTermDepositAmount()
    _branch.PolicyTerm.Bound = true

    bindReinsurableRisks() // flags Activity on error...

    _branch.promoteBranch(false)
  }

  private function handleFinalAudit() {
    _branch.BasedOn.withdrawOpenRevisedFinalAudit()
    _branch.scheduleAllAudits()
  }

  /**
   * If binding fails, set the status of <code>policyPeriod</code> to "Review".
   */
  function failRewrite() {
    canFailBind("fail rewrite").assertOkay()
    JobProcessLogger.logInfo("Failed to bind rewrite for branch: " + _branch)
    _branch.ActiveWorkflow.Processing = false
    Job.createProducerActivity(ActivityPattern.finder.getActivityPatternByCode("issue_failed"),
                               displaykey.Rewrite.IssueRewrite.Failed.Subject,
                               displaykey.Rewrite.IssueRewrite.Failed.Description)
    Job.assignUnderwriter()
  }

  override property get RecalculateDepositOnReportingAfterValidQuote() : boolean {
    return true
  }

  override function createBillingEventMessages() {
    _branch.addEvent(BillingMessageTransport.REWRITEPERIOD_MSG)
  }


  /**
   * Check the conditions for which this policy period can be withdrawn.
   */
  override function canWithdraw() : JobConditions {
    return super.canWithdraw()
            .checkStatus(new PolicyPeriodStatus[] { TC_DRAFT, TC_QUOTED })
  }

  override function issueJob(bindAndIssue : boolean) {
    if (not bindAndIssue) {
      throw new IllegalArgumentException("Bind-only not allowed for Rewrite")
    }
    _branch.onBeginIssueJob()
    rewrite()
  }

}
