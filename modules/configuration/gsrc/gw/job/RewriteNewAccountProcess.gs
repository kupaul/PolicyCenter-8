package gw.job

uses gw.api.job.JobProcessLogger
uses gw.job.permissions.RewriteNewAccountPermissions
uses gw.forms.FormInferenceEngine
uses gw.plugin.messaging.BillingMessageTransport

uses java.lang.IllegalArgumentException
uses java.util.Date

/**
 * Encapsulates the actions taken within a RewriteNewAccount job.
 *
 * @see JobProcess for general information and job process logic.
 * @see gw.plugin.policyperiod.impl.JobProcessCreationPlugin
 */
@Export
class RewriteNewAccountProcess extends NewTermProcess {

  construct(period : PolicyPeriod) {
    super(period, new RewriteNewAccountPermissions(period.Job))
    JobProcessEvaluator = JobProcessUWIssueEvaluator.forRewriteNewAccount()
  }

  override property get Job() : RewriteNewAccount {
    return super.Job as RewriteNewAccount
  }

  /**
   * Initializes a rewrite new account.
   */
  override function start() {
    JobProcessLogger.logInfo("Starting rewrite new account for branch: " + _branch)
    startJobAsDraft()
    _branch.AllReinsurables.each(\ r -> r.remove())
    _branch.RIRiskVersionLists.each(\ r -> r.remove() )
    initializeProducers()
    syncProductModel()
    // assign team members at this point so that automatic assignments will work
    Job.assignRolesFromRewriteNewAccountPolicy()
    _branch.Policy.Account.makeActive()
  }

  /**
   * Rewrites the policy period.
   */
  function rewriteNewAccount() {
    canRewriteNewAccount().assertOkay()
    startBinding()
  }

  function startBinding() {
    JobProcessValidator.validatePeriodForUI(_branch, TC_READYFORISSUE)
    JobProcessEvaluator.evaluateAndCheckForBlockingUWIssues(_branch, TC_BLOCKSISSUANCE)

    // Do AccountSyncable validation here.
    _branch.AllAccountSyncables.each(\ a -> a.prepareForPromote())
    
    withdrawOtherActivePeriods()  // check other activities...
    _branch.updateTermNumber()
    _branch.PolicyNumber = _branch.genNewPeriodPolicyNumber()
    _branch.Status = TC_BINDING
    _branch.ensureProducerOfService()
    _branch.ensureProducerOfRecord()
    _branch.bindAutoNumberSequences()
    FormInferenceEngine.Instance.inferPreBindForms(_branch)
    finishRewriteNewAccount()
    commitBranch("start new account binding")
  }

  /**
   * Finishes the rewriteNewAccount for the policy period.
   */
  function finishRewriteNewAccount() {
    JobProcessLogger.logInfo("Finishing rewriteNewAccount for branch: " + _branch)
    canFinishJob("finish rewriteNewAccount")
        .checkJobNotComplete()
        .checkOnlyActivePeriod()
        .assertOkay()
    _branch.properlySetTransactionFlags()
    Job.Policy.Account.markContactsForAutoSync()
    
    _branch.Job.copyUsersFromJobToPolicy()
    prepareBranchForFinishingJob()
    createBillingEventMessages()
    _branch.scheduleAllAudits()  // ? need to double check on this
    _branch.updatePolicyTermDepositAmount()
    _branch.PolicyTerm.Bound = true
    _branch.Policy.markIssued(Date.Today)

    bindReinsurableRisks() // flags Activity on error...
    _branch.Job.createCustomHistoryEvent(CustomHistoryType.TC_REWR_NEW_ACCT_BOUND, 
            \ -> displaykey.Job.RewriteNewAccount.History.TargetAccount.Description(_branch.PolicyNumber, _branch.Policy.RewrittenToNewAccountSource.Account))
    
    // promote has to be last, look at RenewalProcess            
    _branch.promoteBranch(false)
    commitBranch("finish new account rewrite")
  }

  function canRewriteNewAccount() : JobConditions {
    return canFinishIssue(canIssue("rewriteNewAccount"))
            .checkNotStatus(TC_BINDING)
  }

  /**
   * Checks the conditions for which the policy period can be quoted. Should check for open job for previous policy period?
   */
  override function canRequestQuote() : JobConditions {
    return super.canRequestQuote()
                .checkDraft()
  }

  /**
   * Check the conditions for which this policy period can be withdrawn.
   */
  override function canWithdraw() : JobConditions {
    return super.canWithdraw()
            .checkStatus(new PolicyPeriodStatus[] { TC_DRAFT, TC_QUOTED })
  }

  /**
   * Checks the conditions for which a search for data to copy into the policy can be started
   */
  override function canStartCopyPolicyData() : JobConditions {
    return internalCanStartCopyPolicyData()
  }

  // ===== LIFECYCLE FUNCTIONS =====

  override function createBillingEventMessages() {
     _branch.addEvent(BillingMessageTransport.CREATEPERIOD_MSG)
  }

  override function issueJob(bindAndIssue : boolean) {
    if (not bindAndIssue) {
      throw new IllegalArgumentException("Bind-only not allowed for RewriteNewAccount")
    }
    _branch.onBeginIssueJob()
    rewriteNewAccount()
  }

  /**
   * Remove RewrittenToNewAccount flag from old Policy.
   */
  override protected function withdrawWithoutCheckingConditions() {
    _branch.Policy.clearPolicyLinksForRewriteNewAccount()
    super.withdrawWithoutCheckingConditions()
  }
}
