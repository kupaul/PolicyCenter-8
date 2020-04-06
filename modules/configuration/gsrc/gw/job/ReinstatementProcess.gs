package gw.job

uses gw.api.job.JobProcessLogger
uses gw.forms.FormInferenceEngine
uses gw.job.permissions.ReinstatementPermissions
uses gw.plugin.messaging.BillingMessageTransport
uses java.lang.IllegalArgumentException
uses java.util.Date
uses gw.api.database.Query

/**
 * Encapsulates the actions taken within a Reinstatement job.
 *
 * @see JobProcess for general information and job process logic.
 * @see gw.plugin.policyperiod.impl.JobProcessCreationPlugin
 */
@Export
class ReinstatementProcess extends JobProcess {

  construct(period : PolicyPeriod) {
    super(period, new ReinstatementPermissions((period.Job)))
    JobProcessEvaluator = JobProcessUWIssueEvaluator.forReinstatement()
  }

  override property get Job() : Reinstatement {
    return super.Job as Reinstatement
  }

  // ===== LIFECYCLE FUNCTIONS =====

  /**
   * Initializes a reinstatement.
   */
  override function start() {
    JobProcessLogger.logInfo("Starting reinstatement for branch: " + _branch)
    startJobAsDraft()
    Job.assignRolesFromPolicy()
  }

  /**
   * Checks the conditions for which the policy period can be reinstated.
   */
  function canReinstate() : JobConditions {
    return canFinishIssue(canIssue("reinstate"))
            .checkNotStatus(TC_REINSTATING)
            .checkNoUnhandledPreemptions()
  }

  /**
   * Returns the default written date to use for this job.
   * which should be the written date of the latest non-cancellation job
   */
  override protected property get DefaultWrittenDate() : Date {
    // the BasedOn for the current period would normally be a cancellation,
    //    but it could be a policy change (change after cancel) so use the first found
    //    non-cancel job.
    var priorPeriod = _branch.BasedOn
    while (priorPeriod.Job.Subtype == typekey.Job.TC_CANCELLATION) {
      priorPeriod = priorPeriod.BasedOn
    }
    return priorPeriod.WrittenDate
  }

  /**
   * Begins reinstating the policy period.
   */
  function reinstate() {
    canReinstate().assertOkay()

    _validator.validateReinsurance(_branch)
    JobProcessEvaluator.evaluateAndCheckForBlockingUWIssues(_branch, TC_BLOCKSISSUANCE)

    // Do not do AccountSyncable validation.
    _branch.Status = TC_REINSTATING
    _branch.ensureProducerOfService()
    FormInferenceEngine.Instance.inferPreBindForms(_branch)

    // To make this work asynchronously, uncomment this event and remove the call to finishReinstatement.
    // Whatever responds to the event needs to call finishReinstatement() when it has finished so that
    // PolicyCenter can finish the process.

    //_branch.addEvent("IssueReinstatement")
    finishReinstatement()
    commitBranch("reinstatement")
  }

  /**
   * Finishes reinstating the policy period.
   */
  function finishReinstatement() {
    canFinishJob("finish reinstatement")
      .checkStatus(TC_REINSTATING)
      .assertOkay()

    createBillingEventMessages()
    _branch.Job.copyUsersFromJobToPolicy()
    prepareBranchForFinishingJob()
    processAudits()

    _branch.clearOutstandingCancellationsOrReinstatementsInSamePeriod()
    _branch.updateTrendAnalysisValues()
    _branch.PolicyTerm.DepositReleased = false
    _branch.updatePolicyTermDepositAmount()
 
    _branch.promoteBranch(false)
    commitBranch("finish reinstatement")

    bindReinsurableRisks() // flags Activity on error...

    // test for restart depends on commit of branch promotion...
    if (hasWithdrawnRenewalToRestart()) {
      restartRenewal()
    }
  }

  /**
   * Fails binding, setting the policy period status to "Review."
   */
  function failBinding() {
    Job.createProducerActivity(ActivityPattern.finder.getActivityPatternByCode("issue_failed"),
                               displaykey.Reinstatement.IssueReinstatement.Failed.Subject,
                               displaykey.Reinstatement.IssueReinstatement.Failed.Description)
    canFailBind().assertOkay()
    Job.assignUnderwriter()
  }

  private function processAudits() {
    _branch.withdrawOpenRevisedFinalAudit()
    _branch.withdrawOpenFinalAudit()
    _branch.reverseFinalAudits()
    _branch.removeScheduledFinalAudit()
    _branch.scheduleExpirationFinalAudit()
    _branch.rescheduleAuditSeries()
  }

  override function initializeFuturePeriodJob(futureJob : Job) {
    var futureReinstatement = futureJob as Reinstatement
    futureReinstatement.ReinstateCode = this.Job.ReinstateCode
  }

  override property get RecalculateDepositOnReportingAfterValidQuote() : boolean {
    return true
  }

  override function createBillingEventMessages() {
    _branch.addEvent(BillingMessageTransport.REINSTATEPERIOD_MSG)
  }

  private function restartRenewal() : Renewal {
    var renewal = new Renewal(_branch.Bundle)
    renewal.startJob(_branch.Policy)
    return renewal
  }

  /**
    Call when the reinstatement job finishes and will like to restart any withdrawn renewal,
    which may have been withdrawn because of a cancellation job.
  */
  private function hasWithdrawnRenewalToRestart() : boolean {

    // If there's already a future renewal that has been bound
    // or that's active, there is nothing to withdraw.
    if (_branch.hasFutureRenewals()) {
      return false
    }

    // find all renewal job for this policy that have been completed
    var renewals = Query.make(Renewal).compare(Renewal#Policy.PropertyInfo.Name, Equals, _branch.Policy).select()

    // then find renewals that are in a period after the reinstatement
    // and ones that are not bound (period is draft), which result because
    // of a withdrawl
    for (renewalJob in renewals) {
      var renewal = renewalJob.Periods.first()
      if(renewalJob.Complete
          and renewal.PeriodStart.after(_branch.PeriodStart)
          and renewal.Locked // A withrawn renewal will be locked
          and renewal.Status == TC_WITHDRAWN) {
        return true
      }
    }

    return false
  }

  override function issueJob(bindAndIssue : boolean) {
    if (not bindAndIssue) {
      throw new IllegalArgumentException("Bind-only not allowed for Reinstatement")
    }
    _branch.onBeginIssueJob()
    reinstate()
  }
}


