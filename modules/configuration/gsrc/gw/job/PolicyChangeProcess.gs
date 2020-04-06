package gw.job

uses gw.api.diff.DiffItem
uses gw.api.job.IPolicyChangeProcess
uses gw.api.job.JobProcessLogger
uses gw.api.util.DisplayableException
uses gw.forms.FormInferenceEngine
uses gw.job.permissions.PolicyChangePermissions
uses gw.lang.reflect.IPropertyInfo
uses gw.plugin.diff.IPolicyPeriodDiffPlugin
uses gw.plugin.messaging.BillingMessageTransport
uses gw.plugin.Plugins

uses java.lang.IllegalArgumentException
uses java.util.ArrayList
uses java.util.Date
uses gw.api.job.EffectiveDateCalculator

/**
 * Encapsulates the actions taken within a Policy Change job.
 *
 * @see JobProcess for general information and job process logic.
 * @see gw.plugin.policyperiod.impl.JobProcessCreationPlugin
 */
@Export
class PolicyChangeProcess extends JobProcess implements IPolicyChangeProcess {

  construct(period : PolicyPeriod) {
    super(period, new PolicyChangePermissions(period.Job))
    JobProcessEvaluator = JobProcessUWIssueEvaluator.forPolicyChange()
  }

  override property get Job() : PolicyChange {
    return super.Job as PolicyChange
  }

  // ===== LIFECYCLE FUNCTIONS =====

  /**
   * Initializes a policy change.
   */
  override function start() {
    JobProcessLogger.logInfo("Starting policy change, branch: " + _branch)
    startJobAsDraft()
    Job.assignRolesFromPolicy()
    _branch.expireNextChangeApprovals()
    _branch.expirePastDateApprovals()
    this.Job.createCustomHistoryEvent(TC_CHANGE_CREATED, \ -> displaykey.PolicyChange.History.JobCreated)
  }

  /**
   * Starts an automatic policy change.
   *
   * @param user the User on whose behalf the automatic process runs
   */
  override function startAutomatic(user : User) : void {
    executeAsAutomatedUser(user, \ -> {
      start()
      requestQuote()
      bind()
    })
  }

  /**
   * Checks the conditions for which the policy period can be quoted.
   */
  override function canRequestQuote() : JobConditions {
    return super.canRequestQuote()
            .checkNoUnhandledPreemptions()
  }

  /**
   * Checks the conditions for which the binding proccess of a policy period can be started.
   */
  override function canBind() : JobConditions {
    return canIssue("bind").checkNotStatus(TC_BINDING)
  }

  override function canFinishBind() : JobConditions {
    return canFinishIssue(startChecksFor("finish binding"))
  }

  /**
   * Checks the conditions for which a search for data to copy into the policy can be started
   */
  override function canStartCopyPolicyData() : JobConditions {
    return internalCanStartCopyPolicyData()
  }

  /**
   * Begins the binding process for a PolicyPeriod, setting the period's
   * status to "Binding".
   */
  override function bind() {
    canBind().assertOkay()

    JobProcessValidator.validatePeriodForUI(_branch, TC_BINDABLE)

    if (_branch.Job.OOSJob) {
      JobProcessValidator.validateOOSESlices(_branch, TC_BINDABLE)
    }

    JobProcessEvaluator.evaluateAndCheckForBlockingUWIssues(_branch, TC_BLOCKSISSUANCE)

    // Do AccountSyncable validation here. 
    _branch.AllAccountSyncables.each(\ a -> a.prepareForPromote())

    _branch.Status = TC_BINDING
    withdrawOtherActivePeriods()
    _branch.ensureProducerOfService()
    FormInferenceEngine.Instance.inferPreBindForms(_branch)
    _branch.bindAutoNumberSequences()

    // To make this work asynchronously, uncomment the call to add an event and commit. Then remove the call
    // to finishBinding() below.  Whatever responds to the event must invoke finishBinding()
    // so that PolicyCenter can complete the binding process.

    // _branch.addEvent("IssuePolicyChange")
    // commitBranch("bind policy change")

    finishBinding()
  }

  /**
   * Successfully completes binding of the policy period.
   */
  function finishBinding() {
    canFinishBind()
      .checkJobNotComplete()
      .assertOkay()
    prepareBranchForFinishingJob()
    _branch.Job.copyUsersFromJobToPolicy()
    processAudits()
    createBillingEventMessages()
    _branch.updateTrendAnalysisValues()
    _branch.updatePolicyTermDepositAmount()
    bindReinsurableRisks()
    _branch.promoteBranch(true)

    commitBranch("finish binding")
  }

  private function scheduleFinalAudit() {
    if (_branch.Canceled) {
      _branch.scheduleCancellationFinalAudit()
    }
    else {
      _branch.scheduleExpirationFinalAudit()
    }
  }

  /**
   * Gets the job-specific activity pattern for UW review activity.
   *
   * @see ActivityPatternEnhancement
   */
  override protected property get UWReviewActivityPattern() : ActivityPattern {
    return ActivityPattern.finder.getActivityPatternByCode("approve_policy_change")
  }

  override property get BillingSubjectToFinalAudit() : boolean {
    return _branch.Canceled and (_branch.hasScheduledFinalAudit() or _branch.hasOpenFinalAudit())
  }

  override property get RecalculateDepositOnReportingAfterValidQuote() : boolean {
    return true
  }

  override function createBillingEventMessages() {
    _branch.addEvent(BillingMessageTransport.CHANGEPERIOD_MSG)
  }

  /**
   * Fails policy binding, setting the policy period status to "Review."
   */
  function failBinding() {
    Job.createProducerActivity(ActivityPattern.finder.getActivityPatternByCode("issue_failed"),
                               displaykey.PolicyChange.IssuePolicyChange.Failed.Subject,
                               displaykey.PolicyChange.IssuePolicyChange.Failed.Description)
    canFailBind().assertOkay()
    Job.autoAssignRole(TC_UNDERWRITER)
  }

  override function initializeFuturePeriodJob(futureJob : Job) {
    // Nothing to do
  }

  /**
   * Checks the conditions for which a new version of the policy period can be created.
   */
  override function canMakeNewVersion(): JobConditions {
    return super.canMakeNewVersion()
      .checkJobNotComplete()
  }

  /**
   * Check the conditions for which this policy period can be withdrawn.
   */
  override function canWithdraw() : JobConditions {
    return super.canWithdraw()
            .checkStatus(new PolicyPeriodStatus[] { TC_DRAFT, TC_QUOTED })
  }

  /**
   * Indicates whether changes to current period can be applied to renewal
   * that is bound in the future.
   */
  override function canApplyChangesToFutureBoundRenewal() : boolean {
    return canApplyChangeToFutureRenewal(true)
  }

  /**
   * Indicates whether changes to current period can be applied to an
   * unbound renewal in the future.
   */
  override function canApplyChangesToFutureUnboundRenewal() : boolean {
    return canApplyChangeToFutureRenewal(false)
  }

  /**
   * Applies changes from this policy change to the renewal that is bound
   * in the future.
   */
  override function applyChangesToFutureBoundRenewal() : ApplyChangesResult[] {
    var futureBranch = Job.createFutureJob(_branch.FutureRenewals.first()).LatestPeriod
    _branch.clearResolveWithFuturePeriods()
    var conflicts = applyChanges(futureBranch)
    futureBranch.PolicyChangeProcess.start()
    _branch.Bundle.commit()
    return { new ApplyChangesResult(futureBranch, conflicts, _branch.EditEffectiveDate) }
  }

  /**
   * Applies changes from this policy change to the unbound future renewal.
   */
  override function applyChangesToFutureUnboundRenewal() : ApplyChangesResult[] {
    var futureBranch = _branch.FutureRenewals.first()
    _branch.clearResolveWithFuturePeriods()

    // apply change to every period (e.g. multi-quote renewal)
    var changes = new ArrayList<ApplyChangesResult>()
    for (period in futureBranch.Job.Periods) {

      // assume if the period is not locked then it's still active (i.e., not withdrawn)
      if (not period.Locked) {

        // put into draft state, which invalidates quote
        period.edit()

        if (period.RenewalProcess.ActiveRenewalWorkflow != null) {
          period.completeActiveWorkflow()
        }

        // Get the renewal conflict diffs to at least look like the other job conflict diffs, even
        // though the other job conflict diffs don't always make sense
        var conflicts = filterDiffsForRenewals(period.getDiffItems(DiffReason.TC_APPLYCHANGES))

        applyChanges(period)

        changes.add(new ApplyChangesResult(period, conflicts, _branch.EditEffectiveDate))
      }
    }
    _branch.Bundle.commit()
    return changes.toTypedArray()
  }

  private function processAudits() {
    if (_branch.IsAuditable) {
      // handle reversing/withdrawing audits
      _branch.withdrawOpenRevisedFinalAudit()
      _branch.reverseFinalAudits()
      _branch.rescheduleAuditSeries()
      if (_branch.hasScheduledFinalAudit()) {
        if (_branch.PeriodStart != _branch.BasedOn.PeriodStart or _branch.PeriodEnd != _branch.BasedOn.PeriodEnd) {
          _branch.removeScheduledFinalAudit()
          scheduleFinalAudit()
        }
      } else if (not (_branch.hasOpenFinalAudit() or _branch.hasWaivedFinalAudit())){
        scheduleFinalAudit()
      }
    }
  }

  override function issueJob(bindAndIssue : boolean) {
    if (not bindAndIssue) {
      throw new IllegalArgumentException("Bind-only not supported for issuing policy change jobs.")
    }
    _branch.onBeginIssueJob()
    _branch.checkForSingletonPolicyContactRolesInSlices({
      PolicyBillingContact -> \ period -> period.BillingContact
      }, _branch.OOSSlices)
    bind()
  }

  /**
   * @return a {@link JobConditions} that will be Okay => true if the current policy change can legally be changed
   */
  override function canStartChangeEditEffectiveDate() : JobConditions {
    var jobConditions = startChecksFor("change edit effective date for policy change")

    //perform all the checks against other versions in a single pass
    return jobConditions.checkAllVersions( \ aPeriod : PolicyPeriod ->{
      jobConditions
          .checkStatusForActiveBranch(aPeriod, {PolicyPeriodStatus.TC_DRAFT, PolicyPeriodStatus.TC_QUOTED})
          .checkCondition(aPeriod.Lines.reduce(true, \ v, p -> v && p.canSafelyCEED()), displaykey.Web.Job.Warning.CannotCEEDIfSplitsEdited)
          .checkCondition(aPeriod.JobProcess.Permissions.Edit, displaykey.Web.Job.Warning.LacksEditPermissionForVersion(aPeriod.BranchName))
          .checkCondition(not aPeriod.hasAnyUnhandledPreemptions(), displaykey.Web.Job.Warning.HasUnhandledPreemptions(aPeriod))
    })
  }

  /**
   * Check if the current policy change can legally change its effective date to be {@link newEffectiveDate}
   *
   * @param newEffectiveDate - a date within the current slice
   * @return a {@link JobConditions} that will be Okay => true if the current policy change can legally be changed
   * to {@link newEffectiveDate}, or Okay => false with an error message describing
   */
  override function canFinishChangeEditEffectiveDate(newEffectiveDate : Date) : JobConditions {
     return canStartChangeEditEffectiveDate()
        .checkDateNotCurrentEffectiveDate(newEffectiveDate)
        .checkDateWithinPeriodOrTerm(newEffectiveDate)
  }

  /**
   * Change the effective date of associated with a policy change job.
   * @param newEffectiveDate - the new effective date
   * @return the resulting {@link PolicyPeriod} created by changing the edit effective date for the old active period.
   */
  function changeEditEffectiveDate(newEffectiveDate : Date) : PolicyPeriod {

    if (_branch.Locked){
       throw new DisplayableException(displaykey.Web.Job.Warning.CannotChangeEditEffectiveDate(displaykey.Web.Job.Warning.BranchLocked(_branch)))
    }

    newEffectiveDate = EffectiveDateCalculator.instance()
        .getPolicyChangeEffectiveDate(newEffectiveDate, this._branch, this.Job)
    
    canFinishChangeEditEffectiveDate(newEffectiveDate).assertOkay()

    var oldEffectiveDate = _branch.EditEffectiveDate

    //Ensure that creating the new branches doesn't change the selected version
    var newBranch = changeEditEffectiveDateForSinglePeriod(newEffectiveDate, _branch)
    for (activePeriod in newBranch.Job.ActivePeriods.where(\p -> p != newBranch)) {
        changeEditEffectiveDateForSinglePeriod(newEffectiveDate, activePeriod)
    }

    newBranch.Job.createCustomHistoryEvent(TC_CHANGE_EDIT_EFF_DATE, \ -> displaykey.PolicyChange.History.ChangedEditEffectiveDate(oldEffectiveDate, newEffectiveDate))

    return newBranch
  }

  /**
   * Helper method for #changeEditEffectiveDate(Date).  Change the effective date for a single policy period.  Outside of testing, this method should
   * not be invoked directly.
   *
   * @return a {@link PolicyPeriod} representing the original period with a new edit effective date.  Note, resulting period is not
   * guaranteed to be to same instance as the original policy period,  but may in fact be a new period created from the based on with
   * the same diffs applied as of a different effective date.
   */
  /* package */ function changeEditEffectiveDateForSinglePeriod(newEffectiveDate : Date, srcPeriod : PolicyPeriod) : PolicyPeriod {
    if (JobProcessLogger.isTraceEnabled()){
      JobProcessLogger.logTrace("Starting policy change- change edit effective date for branch: ${_branch} from  ${_branch.EditEffectiveDate} to ${newEffectiveDate}")
    }

    var newBranch = srcPeriod.cloneBranchForEditingEffectiveDate()

    if (JobProcessLogger.isTraceEnabled()){
      JobProcessLogger.logTrace("policy change- change edit effective - created new branch ${newBranch}. Starting to apply changes from ${_branch} to ${newBranch}")
      JobProcessLogger.logTrace("Updating the edit effective date from  ${_branch.EditEffectiveDate} to ${newEffectiveDate}")
    }

    newBranch.EditEffectiveDate = newEffectiveDate
    newBranch = newBranch.getSlice(newEffectiveDate)

    applyChangesWithNewEffectiveDate(srcPeriod, newBranch, newEffectiveDate)

    // miscellaneous business logics
    recalculateApprovalExpirationDates(newBranch, newEffectiveDate)
    newBranch.expirePastDateApprovals()
    newBranch.updateEditEffectiveDateForReinsurance(srcPeriod)

    // edit runs after applyChanges so that it affects beans added by applyChanges
    newBranch.edit()
    return newBranch
  }

  /**
   * For each approval on the given branch, recalculate the approval expiration date if necessary
   * and create an UWHistory event if it has changed.
   */
  private function recalculateApprovalExpirationDates(policyPeriod : PolicyPeriod, newEffectiveDate : Date){
    var approvedUWIssues = getNewlyApprovedUWIssues(policyPeriod, newEffectiveDate)
    for (uwIssue in approvedUWIssues){
      uwIssue.Approval.recalculateExpirationForChangeEffDate()
    }
  }

  private function isDiffNewApproval(diff : DiffItem) : boolean {
    return diff.Property
      and (diff.asProperty().PropertyInfo == getUWIssuePropertyInfo("ApprovalValue") or diff.asProperty().PropertyInfo == getUWIssuePropertyInfo("ApprovalDurationType"))
  }

  private function getUWIssuePropertyInfo(propertyName : String) : IPropertyInfo {
    var propInfo = entity.UWIssue.Type.TypeInfo.getProperty(propertyName)
    if (propInfo == null) {
      throw new IllegalArgumentException("Failed to find property '${propertyName}' on UWIssse")
    }
    return propInfo
  }

  private function filterDiffsForRenewals(diffs : List<DiffItem>) : List<DiffItem> {
    // Find conflicts, but don't include conflicts that are merge changes
    var conflicts = diffs.where(\ d -> not d.MergeChange).toList()

    // Filter the list for display
    var diffPlugin = Plugins.get(IPolicyPeriodDiffPlugin)
    return diffPlugin.filterDiffItems(DiffReason.TC_APPLYCHANGES, _branch, conflicts)
  }

  /**
   * Return a list of the UWIssues that were either just created as of {@link newEffectiveDate} or are newly approved.
   */
  /* package */ function getNewlyApprovedUWIssues(branch : PolicyPeriod, newEffectiveDate : Date) : List<UWIssue>{
    var diffs = branch.getDiffItems(DiffReason.TC_APPLYCHANGES)
    var uwDiffs = diffs.where(\ d -> d.Bean typeis UWIssue
      and d.Bean.EffectiveDate == newEffectiveDate
      and d.Bean.HasApprovalOrRejection and !d.Bean.Rejected
      and (d.Add or isDiffNewApproval(d)))
    return uwDiffs.map(\ d -> d.EffDatedBean.getSliceUntyped(newEffectiveDate) as UWIssue)
  }

  protected function applyChangesWithNewEffectiveDate(srcBranch : PolicyPeriod, newBranch : PolicyPeriod, newEffectiveDate : Date) {
    newBranch.applyChangesFromBranchForDate(srcBranch, newEffectiveDate)

    // If we added objects that need to renumbered that do that here
    newBranch.renumberAutoNumberSequences()

    // if we're applying changes to the branch, syncables should all be in edit - including ones we just applied
    newBranch.AllAccountSyncables.each(\ a -> a.prepareForJobEdit())
  }
}
