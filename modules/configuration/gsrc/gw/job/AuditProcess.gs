package gw.job

uses gw.api.job.JobProcessLogger
uses gw.job.permissions.AuditPermissions
uses gw.policy.PolicyPeriodValidation
uses gw.plugin.messaging.BillingMessageTransport
uses java.util.Date
uses java.lang.UnsupportedOperationException

/**
 * Encapsulates the actions taken within an Audit.
 * 
 * @see JobProcess for general information and job process logic.
 * @see gw.plugin.policyperiod.impl.JobProcessCreationPlugin
 */
@Export
class AuditProcess extends JobProcess {

  construct(period : PolicyPeriod) {
    super(period, new AuditPermissions(period.Job))
      JobProcessEvaluator = JobProcessUWIssueEvaluator.forAudit()
}

  override property get Job() : Audit {
    return super.Job as Audit
  }

  /**
   * Quoting is encapsulated in its own process class, making it easier to modify and extend
   * what happens to generate a quote.
   */
  override property get QuoteProcess() : QuoteProcess {
    var result = super.QuoteProcess
    if (_branch.Audit.AuditInformation.IsPremiumReport) {
      result.TransactionsToInclude = \ t -> t.Charged
    }
    return result
  }

  /**
   * Audit does not require validation.
   */
  override property get JobProcessValidator() : JobProcessValidator {
    return gw.job.JobProcessValidator.NO_OP_VALIDATOR
  }

  // ===== LIFECYCLE FUNCTIONS =====

  /**
   * Initiates the audit.
   */
  override function start() {
    if (rulesRecommendWaivingFinalAudit()) {
      waiveUnconditionally()
    }
    else {
      JobProcessLogger.logInfo("Starting audit for branch: " + _branch)
      startJobAsDraft()
      var method = Job.AuditInformation.AuditMethod
      Job.AuditInformation.ActualAuditMethod = method
      if (not (Job.AuditInformation.IsReversal or Job.AuditInformation.IsRevision)
          and (method == TC_PHONE or method == TC_PHYSICAL)) {
        Job.assignAuditor()
        Job.createRoleActivity(TC_AUDITOR,
                               ActivityPattern.finder.getActivityPatternByCode("new_audit_assigmnent"),
                               displaykey.Audit.NewAuditAssigned,
                               displaykey.Audit.NewAuditAssigned)
      }
    }
  }

  private function rulesRecommendWaivingFinalAudit() : boolean {
    return Job.AuditInformation.IsFinalAudit
        and _branch.FinalAuditOption == TC_RULES
        and not businessRuleRequiresAudit()
  }

  /**
   * Allows customer projects to override with specify logic to determin whether final audit is required.
   * 
   * @return boolean true if the business rule requires a final audit
   */
  function businessRuleRequiresAudit() : boolean {
    return true
  }

  /**
   * Checks the conditions for which the audit can be edited.
   */
  override function canEdit() : JobConditions {
    return startChecksFor("edit")
            .checkEditPermission()
            .checkQuoteIsValid()
            .checkJobNotComplete()
  }

  /**
   * Checks the conditions for which an audit package can be created.
   */
  function canCreateAuditPackage() : JobConditions {
    return startChecksFor("create audit package")
            .checkPermission(perm.Document.create)
            .checkNoUnhandledPreemptions()
  }

  /**
   * Checks the conditions for which the policy period can be quoted.
   */
  override function canRequestQuote() : JobConditions {
    return super.canRequestQuote()
            .checkDraft()
            .checkNotPromoted()
            .checkNoUnhandledPreemptions()
  }

  /**
   * Checks the conditions for which the audit can be waived.
   */
  function canWaive() : JobConditions {
    return startChecksFor("waive")
            .checkPermission(Permissions.Waive)
            .checkBranchNotLocked()
            .checkJobNotComplete()
            .checkNoUnhandledPreemptions()
  }

  /**
   * Checks the conditions for which the audit can be completed.
   */
  function canComplete() : JobConditions {
    var completionConditions = startChecksFor("complete")
            .checkPermission(Permissions.Complete)
    return checkJobCompletionConditions(completionConditions)
  }

  /**
   * Checks the conditions for which the audit reversal can be finished.  We set the permission
   * to "true" here because this is a system-driven process that should not rely on specific
   * user permissions.
   */
  function canFinishReversal() : JobConditions {
    return checkJobCompletionConditions(startChecksFor("finishReversal"))
  }

  private function checkJobCompletionConditions(jobConditions : JobConditions) : JobConditions {
    return jobConditions
            .checkBranchNotLocked()
            .checkQuoteIsValid()
            .checkJobNotComplete()
  }

  override function withdrawJob() {
    this.cancelOpenActivities()
    Job.ActivePeriods.each(\ branch -> branch.JobProcess.withdrawWithoutCheckingConditions())
  }

  /**
   * Moves a policy period into the "AuditComplete" status, signifying that
   * the Audit is completed.  From then on the policy period is completely
   * read-only, and any new work on this audit must be done by calling revise.
   */
  function complete() {
    complete(false)
  }

  /**
   * Completes the audit.
   * 
   * @param skipValidation Allows bypass of validation for testing purposes only.
   */
  function complete(skipValidation : boolean){
    canComplete().assertOkay()
    finishUnconditionally(skipValidation)
  }

  /**
   * Finishes the reversal.
   * 
   * @param skipValidation Allows bypass of validation for testing purposes only.
   */
  function finishReversal(skipValidation : boolean){
    canFinishReversal().assertOkay()
    finishUnconditionally(skipValidation)
  }

  override function createBillingEventMessages() {
    if(_branch.Audit.AuditInformation.IsFinalAudit) {
      _branch.addEvent(BillingMessageTransport.FINALAUDIT_MSG)
    }
    else if(_branch.Audit.AuditInformation.IsPremiumReport) {
      _branch.addEvent(BillingMessageTransport.PREMIUMREPORT_MSG)
    }
  }

  /**
   * Waves the audit.
   */
  function waive(){
    canWaive().assertOkay()
    waiveUnconditionally()
  }

  /**
   * Audit are never issued as they are internal jobs that do not result in a bound policy.
   */
  override function issueJob(bindAndIssue : boolean) {
    throw new UnsupportedOperationException("Cannot issueJob for AuditProcess")
  }

  /**
   * We make this return false to make extra sure Audit jobs don't expire.
   * 
   */
  override function canExpireJob() : boolean {
    return false;
  }

  override protected function processSpecificPreemptionHandling(newBranch : PolicyPeriod) {
    if (newBranch.CancellationDate != null) {
      newBranch.Lines.each(\ p -> p.prorateBasesFromCancellation())
    }
  }

  override protected function runPreQuote() {
    validate()
  }
  
  //
  // PRIVATE SUPPORT METHODS
  //
  private function validate() {
    PolicyPeriodValidation.validateForAudit(_branch, "quotable").raiseExceptionIfProblemsFound()
  }

  private function waiveUnconditionally() {
    Job.AuditInformation.markWaived(_branch)
    _branch.markInvalidQuote()
    _branch.Status = TC_WAIVED
    Job.CloseDate = Date.CurrentDate
    _branch.lockBranch()
    JobProcessLogger.logInfo("Audit waived for branch: " + _branch)
  }

  private function finishUnconditionally(skipValidation : boolean) {
    if (not skipValidation) {
      PolicyPeriodValidation.validateForAudit(_branch, TC_BINDABLE).raiseExceptionIfProblemsFound()
    }
    // In final audit for WC reporting policies, deposit released is set to true and deposit is set
    // to 0 when sent to the billing system.  In premium report for WC reporting policies, deposit
    // is set to null when sent to the billing system.  See calculateDeposit() in PolicyInfoExt for
    // more information.

    if (_branch.Audit.AuditInformation.IsFinalAudit and _branch.ReportingPlanSelected) {
      _branch.PolicyTerm.DepositReleased = true
    }

    createBillingEventMessages()
    if (_branch.Audit.AuditInformation.IsPremiumReport) {
      _branch.updateTrendAnalysisValues()
      if (not _branch.Audit.AuditInformation.IsReversal) {
        rules.Audit.ReportingTrendAnalysis.invoke(_branch)
      }
    }
    _branch.enqueueForCededPremiumCalculation(RIRecalcReason.TC_AUDITCOMPLETE, null)
    Job.CloseDate = Date.CurrentDate
    _branch.Status = TC_AUDITCOMPLETE
    _branch.lockBranch()

    commitBranch("finish audit")
  }


}
