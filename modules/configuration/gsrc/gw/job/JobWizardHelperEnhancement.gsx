package gw.job

uses gw.api.web.job.JobWizardHelper
uses gw.job.uw.UWAuthorityBlocksProgressException
uses gw.web.productmodel.ProductModelSyncIssueWrapper
uses gw.web.productmodel.ProductModelSyncIssueSeverity
uses gw.transaction.Transaction
uses gw.validation.PCValidationContext
uses pcf.JobForward
uses com.guidewire.pl.system.bundle.validation.BundleValidationOption

uses java.lang.IllegalArgumentException

enhancement JobWizardHelperEnhancement : JobWizardHelper {

  function goToVisibleStep(period: PolicyPeriod) {
    if (!this.isStepVisitable(this.getCurrentStep())) {
      if (this.isStepVisitable("PolicyReview")) {
        this.goDirectlyToStep("PolicyReview")
      } else if (this.isStepVisitable("PolicyInfo")) {
        this.goDirectlyToStep("PolicyInfo")
      } else {
        var stepId = this.getInitialWizardStepId(period)
        this.goDirectlyToStep( stepId )
      }
    }
  }

  /**
   *  Risk Analysis step could be a wizard step, or a step in the JobWizardTools Menu
   *  Certain jobs do not have a Risk Analysis step.  Those jobs include
   *  Audit, or Cancel or a quick quotes.  For those jobs, use the Tools menu
   *  Otherwise use the Risk Analysis step in the wizard
   * @param job - the Job typekey
   */
  function goToRiskAnalysisStep(job : Job) {
    if ((job.Subtype == typekey.Job.TC_AUDIT or job.Subtype == typekey.Job.TC_CANCELLATION)
    or  (job.Subtype == typekey.Job.TC_SUBMISSION and (job as Submission).QuickMode)) {
      this.goToStep("RiskEvaluation")
    }
    this.goToStep("RiskAnalysis")
  }

  /**
   *  Risk Evaluation is the Risk Analysis menu item.  It should only be visible
   *  for jobs that do not have a Risk analysis step in the job wizard. That included
   *  Audit, or Cancel or a quick quotes
   *  @param job - the Job typekey
   */
  function isRiskEvaluationVisible(job : Job) : boolean {
    if ((job.Subtype == typekey.Job.TC_AUDIT or job.Subtype == typekey.Job.TC_CANCELLATION)
    or  (job.Subtype == typekey.Job.TC_SUBMISSION and (job as Submission).QuickMode)) {
      return true
    }
    return false
  }

  /**
   * Withdraw the period's Job (in a separate Bundle) and cancel any edit changes.
   */
  function withdraw(period : PolicyPeriod) {
    withdrawInNewBundle(period)
    this.Wizard.closeWorksheets()
    if (this.Wizard.EditController.hasChangeToPersist()) {
      this.Wizard.cancel()
    } else {
      this.Wizard.commit() // nothing to commit, but resets state...
    }
  }

  // Calls withdrawJob on the period's job process
  function withdrawInNewBundle(period : PolicyPeriod) {
    Transaction.runWithNewBundle( \ b -> {
      var p = b.loadBean(period.ID) as PolicyPeriod
      p.JobProcess.withdrawJob()
    })
  }

  /**
   *
   */
  function getQuoteStep(period : PolicyPeriod) : String {
    if (!period.MultiLine) {
      return "ViewQuote"
    } else {
      return "ViewMultiLineQuote"
    }
  }

  /**
   * Requests a quote by calling the requestQuote method on the associated JobProcess.  This method will always
   * first call revalidateModel to check for things like missing required fields; if that check fails it will
   * do nothing else.  Otherwise, it will save the wizard and then proceed to calling requestQuote, which will
   * perform the necessary validation before continuing on with the rest of the quote process.
   */
  function requestQuote(policyPeriod : PolicyPeriod, nextStep : String) {
    requestQuote(policyPeriod, nextStep, ValidationLevel.TC_QUOTABLE, RatingStyle.TC_DEFAULT)
  }

  function requestQuote(policyPeriod : PolicyPeriod, nextStep : String, validationLevel : ValidationLevel, rStyle : RatingStyle) {
    var jobProcessAction = getJobProcessAction(policyPeriod.Submission.QuoteType, policyPeriod, nextStep, validationLevel, rStyle)
    doWithUWRedirect(policyPeriod, "BlocksQuote", false, \ -> {
      jobProcessAction.preProcess()
      jobProcessAction.process()
    })
  }

  /**
   * Job-agnostic way to "finish" the Job, and promote it to the level of issuance.
   */
  function requestIssueJob(policyPeriod : PolicyPeriod) {

    // make sure we are in the current slice (not in a future one)
    policyPeriod = policyPeriod.getSlice(policyPeriod.EditEffectiveDate)
    requestIssueJob(policyPeriod, true, true)

  }

  function requestIssueJob(policyPeriod : PolicyPeriod, bindAndIssue : boolean, finishWizard : boolean) {
    var blockingPoint : UWIssueBlockingPoint = bindAndIssue ? "BlocksIssuance" : "BlocksBind"
    doWithUWRedirect(policyPeriod, blockingPoint, finishWizard, \ -> {
      policyPeriod.JobProcess.issueJob(bindAndIssue)
    })
  }

  function requestRenewRenewal(policyPeriod : PolicyPeriod) {
    doWithUWRedirect(policyPeriod, "BlocksBind", false, \ -> {
      policyPeriod.RenewalProcess.preSchedulePendingRenewal()
      pcf.RenewalWizard_RenewalPopup.push(policyPeriod.Renewal, policyPeriod)})
  }

  /**
   * Synchronizes the wizard state with the state of the current bundle. Usually called after custom commits in the UI.
   */
  function synchronizeWizardStateAfterRealCommit() {
    this.Wizard.EditController.commitChanges(BundleValidationOption.VALIDATE_ERRORS_AND_WARNINGS)
    this.Wizard.startEditing()
  }

  private function doWithUWRedirect(period : PolicyPeriod, bp : UWIssueBlockingPoint, finishWizard : boolean, jobProcessAction : block()) {
    if (this.revalidateModel()) {
      try {
        jobProcessAction()
        if (finishWizard) {
          this.Wizard.finish()
          redirectAfterBinding("Binding")
        }
      } catch (e : UWAuthorityBlocksProgressException) {
        saveDraftAndIgnoreValidation()
        pcf.UWBlockProgressIssuesPopup.push(period, this, bp, e.BlockingIssues)
      }
    }
  }

  function getJobProcessAction(type : QuoteType, policyPeriod : PolicyPeriod, nextStep : String, vLevel : ValidationLevel, rStyle : RatingStyle) : JobProcessAction {
    if (type == QuoteType.TC_QUICK and policyPeriod.PersonalAutoLineExists) {
      return new QuickQuoteJobProcessAction(this, policyPeriod, nextStep, vLevel, rStyle)
    } else {
      return new FullAppJobProcessAction(this, policyPeriod, nextStep, vLevel, rStyle)
    }
  }

  function saveDraftAndIgnoreValidation() {
    PCValidationContext.doWhileIgnoringPageLevelValidation( \ -> this.Wizard.saveDraft())
  }

  function validateAndSaveDraft(){
    var jobWizard = this.Wizard
    var valid = jobWizard.reValidateModel()
    if (valid){
      jobWizard.saveDraft()
    }
  }

  static function applyChangesToFutureBoundRenewal(policyPeriod : PolicyPeriod) {
    var results = policyPeriod.JobProcess.applyChangesToFutureBoundRenewal()
    pcf.JobForward.go(results.first().Branch.Job) // All results from same job
    for (result in results) {
      if (result.hasConflicts()) {
        pcf.ViewChangeConflictsWorksheet.goInWorkspace(result,
          displaykey.Web.Job.FuturePeriod.Conflicts.Bound.Tab(result.Branch.BranchName),
          displaykey.Web.Job.FuturePeriod.Conflicts.Bound.Title)
      }
    }
  }

  static function applyChangesToFutureUnboundRenewal(policyPeriod : PolicyPeriod) {
    var results = policyPeriod.JobProcess.applyChangesToFutureUnboundRenewal()
    pcf.JobForward.go(results.first().Branch.Job) // All results from same job
    for (result in results) {
      if (result.hasConflicts()) {
        pcf.ViewChangeConflictsWorksheet.goInWorkspace(result,
          displaykey.Web.Job.FuturePeriod.Conflicts.Unbound.Tab(result.Branch.BranchName),
          displaykey.Web.Job.FuturePeriod.Conflicts.Unbound.Title)
      }
    }
  }

  function addSyncIssueToWebMessages(issue : ProductModelSyncIssueWrapper) {
    addSyncIssueToWebMessages(issue.Severity, issue.Message)
  }

  function addSyncIssueToWebMessages(severity : ProductModelSyncIssueSeverity, msg : String) {
    switch(severity) {
      case ProductModelSyncIssueSeverity.ERROR:
          this.addErrorWebMessage(msg)
          break
      case ProductModelSyncIssueSeverity.WARNING:
          this.addWarningWebMessage(msg)
          break
      case ProductModelSyncIssueSeverity.INFO:
          this.addInfoWebMessage(msg)
          break
      default: throw new IllegalArgumentException("Unknown issue severity" + severity)
    }
  }

  function getInitialWizardStepId(branch: PolicyPeriod) : String {
    if ( branch.ValidQuote ) {
      return getQuoteStep(branch)
    } else {
      return null
    }
  }

  function redirectAfterBinding(waitingStatus : PolicyPeriodStatus){

    var branch : PolicyPeriod = this.PolicyPeriod

    // If the status is still in the "waiting" state that means we're doing things asynchronous, so push to the popup
    if (branch.Status == waitingStatus) {
      pcf.PleaseBePatientPopup.push( branch, this, null, new gw.job.patience.BranchStatus( this, waitingStatus ))
    } else {
      // Otherwise, we must be done, so take the appropriate action based on whether or not the action succeeded
      redirectBasedOnBranchStatus(branch, null)
    }
  }

  function redirectBasedOnBranchStatus(branch : PolicyPeriod, nextStep : String) {
    if (branch.Status == "Quoting") {
      this.addInfoWebMessage( displaykey.Web.SubmissionWizard.QuoteReviewMessage.Quoting)
      this.goToVisibleStep(branch)
    } else if (branch.Status == "Declined" or branch.Status == "Withdrawn") {
      pcf.JobFailedForward.go(branch.Job, branch)
    } else if (branch.Status == "Draft") {
      this.addInfoWebMessage( displaykey.Web.Wizard.QuoteReviewMessage.SoftDeclined(branch.Job.Subtype.DisplayName.toLowerCase()))
      this.goToVisibleStep(branch)
    } else if (branch.Status == "Quoted" and not branch.ValidQuote) {
       this.addInfoWebMessage( displaykey.Web.SubmissionWizard.QuoteReviewMessage.InvalidQuote)
       this.goToVisibleStep(branch)
    } else if (branch.Status == "Canceling") {
      pcf.JobComplete.go(branch.Job, branch)
    } else if (branch.Status == "Rescinded") {
      pcf.JobComplete.go(branch.Job, branch)
    } else if(nextStep == null) {
      pcf.JobComplete.go(branch.Job, branch)
    } else {
      this.goDirectlyToStep(nextStep)
      this.goToVisibleStep(branch)
    }
  }

  function convertQuickQuoteToFullApp(submissionProcess : SubmissionProcess, policyPeriod : PolicyPeriod) {
    submissionProcess.convertToFullApp()

    if (policyPeriod.PersonalAutoLineExists) {
       // avoid potential validation errors which prevents from switching to full-app
      this.Wizard.EditController.commitChanges(BundleValidationOption.DONT_VALIDATE)
      JobForward.go(submissionProcess.Job, policyPeriod)
    } else {
      this.goToStep("PolicyInfo")
    }
  }

  /**
   * This method gets called before Quote or Issue because those processes commit at least once (or more),
   * thus leaving many objects in a state where they have a NULL bundle. Thus, we need to force these
   * UI elements to refresh themselves from the data store so as to avoid an exception when the UI redraws.
  */
  function invalidateIterators() {
    gw.api.web.PebblesUtil.invalidateIterators(this.Wizard, gw.web.policy.RiskEvaluationPanelSetModalRow)
    gw.api.web.PebblesUtil.invalidateIterators(this.Wizard, PolicyLocation)
    gw.api.web.PebblesUtil.invalidateIterators(this.Wizard, Modifier)
  }
}