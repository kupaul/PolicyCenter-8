package gw.job

// TODO do we want a gateway for PCProfilerTag?
uses gw.pl.persistence.core.Key
uses gw.api.system.PLDependenciesGateway
uses gw.api.diff.DiffItem
uses gw.api.job.JobProcessLogger
uses gw.api.web.job.JobWizardHelper
uses gw.assignment.AssignmentUtil
uses gw.job.permissions.CombinedPermissionPolicies
uses gw.plugin.Plugins
uses gw.plugin.billing.IBillingSystemPlugin
uses gw.plugin.billing.PaymentPreviewItem
uses gw.plugin.diff.IPolicyPeriodDiffPlugin
uses gw.plugin.reinsurance.IReinsurancePlugin
uses gw.web.productmodel.ProductModelSyncIssueWrapper

uses java.lang.UnsupportedOperationException
uses java.util.ArrayList
uses java.util.Date
uses java.util.WeakHashMap
uses gw.internal.ext.org.apache.commons.collections.keyvalue.MultiKey
uses gw.api.profiler.PCProfilerTag
uses gw.api.system.PCLoggerCategory
uses java.lang.Exception

/**
 * JobProcess classes encapsulate all of the actions that can be taken in the context of a Job.
 * This base class provides support for actions that are common across all or many of the jobs.
 * <p/>
 * The JobProcess is associated with a specific policy period and its related job.  Validation is quite
 * an extensive task and JobProcessValidator encapsulates the ways in which validation can happen.
 * JobProcessEvaluator encapsulates the interaction with the Underwriting Authority feature.
 * <p/>
 * <b>Note:</b> The JobProcess classes involve complex logic that is extremely sensitive to
 * modification.  To implement changes to out-of-the-box logic, one approach is to subclass the
 * existing JobProcess class and override methods as needed.  Use JobProcessCreationPlugin to construct
 * a different implementation.  This approach preserves the original logic for reference.  As of the 4.0.2
 * maintenance release, the JobProcess classes are exported, so another approach is to modify the
 * classes directly.  In either case, proceed with caution.  Seemingly small changes can break the jobs.
 * <p/>
 * Typically, methods are named by the action that they take, e.g., edit, requestQuote, withdraw.
 * Often an additional "can" method accompanies the action method -- e.g., canEdit, canRequestQuote,
 * canWithdraw -- allowing a single place to check that current conditions allow the action. The
 * "can" methods are useful in PCFs for determining the state of widget properties, such as visibility.
 * The "can" methods work with JobCondition and return an instance that holds information about problems
 * that prevent the associated action from taking place.
 * <p/>
 * Many hooks are written into the JobProcesses to allow certain kinds of custom logic to occur at
 * safe points.  Abstract functions require some sort of logic (even if the logic is a no-op) from
 * subclasses.  Other hooks are more subtle but should be evident from code comments.
 * <p/>
 * In particular, there are a number of points where processing may occur on another
 * system.  Out of the box, the JobProcesses are written synchronously for simplicity.  (We try to keep it
 * simple. Some things just aren't.)  It may be that certain processing is done by external
 * systems, and making users wait for the response may be inappropriate.  There are comments
 * in the code about how to use events to make job processes work asynchronously as appropriate.
 * The existance of a "finish" method is an indication of where asynchronous process is supported
 * without too much configuration work.  For example, in a submission the bind process starts with
 * the bind() method and ends with the finishBind() method, providing an opportunity for additional
 * processing in between.
 *
 * @see gw.plugin.policyperiod.impl.JobProcessCreationPlugin
 * @see JobConditions
 */
@Export
abstract class JobProcess implements gw.api.job.IJobProcess {

  protected var _branch : PolicyPeriod

  protected var _validator : JobProcessValidator as JobProcessValidator = new JobProcessValidator()
  protected var _evaluator : JobProcessUWIssueEvaluator as JobProcessEvaluator = new JobProcessUWIssueEvaluator()
  protected var _jobTypePermissions : JobTypePermissions as Permissions
  private var _automatedProcess = false

  var _isQuoting : boolean as readonly IsQuoting = false
  var _beanCache : WeakHashMap<MultiKey, Object> as BeanCache = {}

  /**
   * Constructor
   *
   * @param period  The PolicyPeriod that the job process is for
   * @param jobSpecificTypePermissions Wraps permissions for the current job
   */
  construct(period : PolicyPeriod, jobSpecificTypePermissions : JobTypePermissions) {
    if (period == null) {
      throw "Period is null. Job Process classes cannot function correctly without a period."
    }
    if (jobSpecificTypePermissions == null) {
      throw "JobTypePermissions is null. Job Process classes cannot function correctly" +
            "without access to permissions data."
    }
    _branch = period
    _jobTypePermissions = new CombinedPermissionPolicies(jobSpecificTypePermissions, period)
  }

  property get Job() : Job {
    return _branch.Job
  }

  /**
   * Quoting is encapsulated in its own process class, making it easier to modify and extend
   * what happens to generate a quote.
   */
  protected property get QuoteProcess() : QuoteProcess {
    return new QuoteProcess(this)
  }

  /**
   * Checks the conditions for which the lock can be released.
   */
  function canReleaseLock() : boolean {
    return _branch.EditLocked and perm.System.editlockoverride and (not _branch.hasAnyUnhandledPreemptions())
  }

  /**
   * Cancels open activities on the Job associated with this process.  This is
   * slightly more than a convenience method since although the same function is
   * available on Job, this overrides any edit permissions on the activities.
   */
  function cancelOpenActivities() {
    // execute as SuperUser since the current user may be
    //    neither an assigner nor an assignee...
    executeAsSuperUser(\ -> {Job.cancelOpenActivities()})
  }

  // ===== LIFECYCLE FUNCTIONS =====

  /**
   * Creates a new JobConditions instance for the given operation against
   * the policy period associated with this JobProcess instance.
   *
   * @param operation name of the operation for which checks are being run
   */
  protected function startChecksFor(operation : String) : JobConditions {
    return new JobConditions(_branch, operation)
  }

  /**
   * Initiates Job the with status of "New".
   */
  protected function startJobAsNew() {
    startJobWithStatus(TC_NEW)
  }

  /**
   * Initiates Job the with status of "Draft".
   */
  protected function startJobAsDraft() {
    startJobWithStatus(TC_DRAFT)
  }

  /**
   * Initiates Job the with the given status.
   */
  private function startJobWithStatus(status : PolicyPeriodStatus) {
    canStartJob().assertOkay()
    JobProcessLogger.logInfo("Starting " + Job.DisplayType + " job with status: " + status)
    _branch.WrittenDate = this.DefaultWrittenDate
    _branch.Status = status
    _branch.EditLocked = false
    _branch.QuoteHidden = false
    _branch.markInvalidQuote()
    _branch.AllAccountSyncables.each(\ a -> a.prepareForJobStart())
  }

  /**
   * Returns the default written date to use for this job.
   */
  protected property get DefaultWrittenDate() : Date {
    return Date.CurrentDate
  }

  /**
   * Runs checks that conditions are right to start the job.
   */
  protected function canStartJob() : JobConditions {
    return canStartJob("start job")
  }

  protected function canStartJob(operation : String) : JobConditions {
    return startChecksFor(operation)
      .checkBranchNotLocked()
      .checkNotQuoted()
  }

  protected function canFinishJob(operation : String) : JobConditions {
     return startChecksFor(operation)
       .checkBranchNotLocked()
       .checkQuoteIsValid()
  }
  /**
   * The status states from which the policy period can be switched into
   * edit mode ("Draft" status). Some processes may have custom statuses
   * from which editing may be allowed.
   */
  protected property get AllowedEditStatus() : PolicyPeriodStatus[] {
    return {TC_QUOTING, TC_QUOTED}
  }

  /**
   * Checks the conditions for which the policy period can be switched
   * to edit mode ("Draft" status).
   */
  function canEdit() : JobConditions {
    return startChecksFor("edit")
            .checkBranchNotLocked()
            .checkStatus(AllowedEditStatus)
            .checkEditPermission()
            .checkNoUnhandledPreemptions()
  }

  protected function canPromoteToDraft() : JobConditions {
    return startChecksFor("begin editing")
      .checkBranchNotLocked()
      .checkEditPermission()
      .checkNew()
  }

  /**
   * Switches the policy period to edit mode.
   */
  function edit() {
    canEdit().assertOkay()
    JobProcessLogger.logInfo("Editing branch: " + _branch)
    _branch.edit()
  }

  /**
   * Moves a policy from "New" to "Draft" status.
   */
  function beginEditing() {
    canPromoteToDraft().assertOkay()
    JobProcessLogger.logDebug("Begin editing branch: " + _branch)

    _branch.edit()

    _branch.runSegmentationRules()
    _branch.autoSelectUWCompany()
  }

  /**
   * Return {@link JobConditions} that is Okay=True if a user can
   * <ul>
   *  <li>Access the Change Edit Effective Date Page</li>
   *  <li>Other conditions required for the operation are available.</li>
   * </ul>
   */
  function canStartChangeEditEffectiveDate() : JobConditions {
    return startChecksFor("change edit effective date")
      .check(false, "Unsupported operation")
  }

  /**
   *
   */
  function canFinishChangeEditEffectiveDate(newEffectiveDate : Date) : JobConditions {
    return canStartChangeEditEffectiveDate()
      .check(false, "Unsupported operation")
  }

  /**
   * Checks the conditions for which the policy period can be quoted.
   */
  function canRequestQuote() : JobConditions {
    return startChecksFor("quote")
            .checkQuotePermission()
            .checkNotQuoted()
            .checkJobNotComplete()
            .checkNoUnhandledPreemptions()
            .checkBranchNotLocked()
            .checkAdvancePermission()
  }

  /**
   * Attempts to generate a quote.
   */
  function requestQuote() {
    requestQuote(null as JobWizardHelper, ValidationLevel.TC_QUOTABLE, RatingStyle.TC_DEFAULT, true)
  }

  /**
   * Attempts to generate a quote, using the specified job wizard helper to
   * use for error reporting purposes.  Calls through to the QuoteProcess instance.
   *
   * @param jobWizardHelper For adding messages to UI
   */
  function requestQuote(jobWizardHelper : JobWizardHelper) {
    requestQuote(jobWizardHelper, ValidationLevel.TC_QUOTABLE, RatingStyle.TC_DEFAULT, true)
  }

  /**
   * Attempts to generate a quote.
   * @param valLevel Validation level that quoting should use
   * @param ratingStyle Passed on to the rating plugin
   */
  function requestQuote(valLevel: ValidationLevel, ratingStyle : RatingStyle) {
    requestQuote(null, valLevel, ratingStyle, true)
  }

  function requestQuote(jobWizardHelper : JobWizardHelper, valLevel: ValidationLevel, ratingStyle : RatingStyle) {
    requestQuote(jobWizardHelper, valLevel, ratingStyle, true)
  }

  /**
   * Attempts to generate a quote.
   * @param jobWizardHelper Passed on to requestQuote
   * @param valLevel Validation level that quoting should use
   * @param ratingStyle Passed on to the rating plugin
   * @param warningsThrowException Do warnings throw validation exceptions
   */
  function requestQuote(jobWizardHelper : JobWizardHelper, valLevel: ValidationLevel, ratingStyle : RatingStyle, warningsThrowException : boolean) {
    PCProfilerTag.JOB_PRE_QUOTE.execute(\ -> runPreQuote())
    try {
      _isQuoting = true
      BeanCache.clear()
      PCProfilerTag.JOB_CHECK_CAN_QUOTE.execute(\ -> canRequestQuote().assertOkay())
      PCProfilerTag.JOB_REQUEST_QUOTE.execute(\ -> QuoteProcess.requestQuote(jobWizardHelper, valLevel, ratingStyle, warningsThrowException))
    } finally {
      _isQuoting = false
      BeanCache.clear()
    }
  }

  /**
   * Return {@link JobConditions} that is Okay=True if a user can
   * Access the Copy Policy Data Search Page
   */
  function canStartCopyPolicyData() : JobConditions {
    return startChecksFor("copy data")
      .check(false, "Unsupported operation")
  }

  protected function internalCanStartCopyPolicyData() : JobConditions {
    return startChecksFor("copy data")
      .checkDraft()
      .checkNotPromoted()
      .checkNotQuickQuote()
      .checkNotUWLocked()
      .checkCondition(this._branch.JobProcess.Permissions.Edit, displaykey.Web.Job.Warning.LacksEditPermissionForVersion(this._branch.BranchName))
      .checkPermission(Permissions.CopyPolicyData)
  }

  /**
   * Checks whether a valid quote can be viewed by current user
   */
  function canViewQuote() : boolean {
    var canView = _branch.ValidQuote and (not _branch.QuoteHidden or perm.System.quotehideoverride)
    return canView
  }

  /**
   * Checks the conditions for which a new version of the policy period can be created.
   */
  function canMakeNewVersion(): JobConditions {
    var jobConditions = startChecksFor("make new version")

    jobConditions.checkPermission(Permissions.Create)
    if (Job.SideBySide) {
      jobConditions.checkNotMaxSideBySideQuotes()
    } else {
      jobConditions.checkQuoteIsValid()
      jobConditions.checkNotMaxQuotes()
    }
    jobConditions.checkBranchNotLocked()
    jobConditions.checkNoUnhandledPreemptions()

    return jobConditions
  }

  /**
   * Checks the conditions for which the binding proccess of a policy period can be started.
   */
  function canBind() : JobConditions {
    return canBind("bind")
  }

  /**
   * Checks the conditions for which the binding proccess of a policy period can be started.
   */
  function canBind(operation : String) : JobConditions {
    return startChecksFor(operation)
      .checkBranchNotLocked()
      .checkAdvancePermission()
      .checkNoUnhandledPreemptions()
      .checkNoFutureTermsArchived()
      .checkPermission(Permissions.Bind)
  }

  protected function canFinishBind() : JobConditions {
    return canFinishBind(startChecksFor("finish binding"))
  }

  protected function canFinishBind(jobConditions : JobConditions) : JobConditions {
    return jobConditions
      .checkQuoteIsValid()
  }

  protected function canFailBind() : JobConditions {
    return canFailBind("fail binding")
  }
  // The conditions for failing issuing are the same as for binding
  protected function canFailIssue() : JobConditions {
    return canFailBind("fail issuing")
  }
  protected function canFailBind(operation : String) : JobConditions {
    return startChecksFor(operation)
      .checkBranchNotLocked()
  }

  /**
   * Checks the conditions for which the policy period can be bound.
   */
  function canIssue() : JobConditions {
    return canIssue("issue")
  }
  function canIssue(operation : String) : JobConditions {
    return startChecksFor(operation)
        .checkBranchNotLocked()
        .checkQuoteIsValid()
        .checkAdvancePermission()
        .checkNoUnhandledPreemptions()
        .checkNoFutureTermsArchived()
        .checkPermission(Permissions.Bind)
        .checkPermission(Permissions.Issue)
  }

  protected function canFinishIssue(jobConditions : JobConditions) : JobConditions {
    return jobConditions
        .checkNoUnhandledPreemptions()
        .checkOnlyActivePeriod()
  }

  function bind() {
    throw "This process does not support bind(). Look for another method."
  }

  /** Gets the job specific activity pattern for UW review activity
  * see ActivityPatternEnhancement
  */
  protected property get UWReviewActivityPattern() : ActivityPattern {
    return ActivityPattern.finder.getActivityPatternByCode("approve_general")
  }

  /**
   * Puts policy period in underwriter review.
   */
  function review() {
    startChecksFor("review").checkBranchNotLocked().assertOkay()
    Job.assignUnderwriter()
    Job.cancelOpenActivitiesForCategory(TC_UWREVIEW)
    Job.createRoleActivity(TC_UNDERWRITER, UWReviewActivityPattern,
                            displaykey.Job.Review.Activity.Subject(Job.Subtype.Description),
                            displaykey.Job.Review.Activity.Description)
  }

  /**
   * Checks the conditions for which preemptions can be handled.
   */
  function canHandlePreemptions() : JobConditions {
    return startChecksFor("handle preemptions")
            .checkHasUnhandledPreemptions()
            .checkBranchNotLocked()
  }

  /**
   * Resolves unhandled preemptions and returns the new policy period.
   * NOTE: Access the job directly via the newBranch (rather than the Job property),
   * since this current period has been ripped off the Job and replaced with the
   * newBranch at this point in time.
   */
  function handlePreemptions() : ApplyChangesResult {
    canHandlePreemptions().assertOkay()

    var newBranch = _branch.createNewBranchForPreemption()

    // give JobProcess subclasses a chance to have their say
    processSpecificPreemptionHandling(newBranch)

    var conflicts = applyChanges(newBranch)
    // edit runs after applyChanges so that it affects beans added by applyChanges
    newBranch.edit()

    return new ApplyChangesResult(newBranch, conflicts, _branch.EditEffectiveDate)
  }

  /**
   * Overridden by processes that have special preemption handling requirements
   */
  protected function processSpecificPreemptionHandling(newBranch : PolicyPeriod) {
  }

  /**
   * If this change is already being applied to the future renewal at
   * job finish, don't offer it as an option in the UI when the
   * job completes.
   */
  function applyChangeToFutureRenewalAutomatic() : boolean {
    return false
  }

  /**
   * Indicates whether changes to current period can be applied to renewal
   * that is bound in the future.
   */
  function canApplyChangesToFutureBoundRenewal() : boolean {
    return false
  }

  /**
   * Indicates whether changes to current period can be applied to an
   * unbound renewal in the future.
   */
  function canApplyChangesToFutureUnboundRenewal() : boolean {
    return false
  }

  /**
   * Applies changes from this policy change to the renewal that is bound
   * in the future.
   */
  function applyChangesToFutureBoundRenewal() : ApplyChangesResult[] {
    throw "Can't apply change to " + (typeof Job)
  }

  /**
   * Applies changes from this policy change to the unbound future renewal.
   */
  function applyChangesToFutureUnboundRenewal() : ApplyChangesResult[] {
    throw "Can't apply change to " + (typeof Job)
  }

  /**
   * Indicates whether changes to current period can be applied to an
   * unbound renewal in the future.
   */
  protected function canApplyChangeToFutureRenewal(promoted : boolean) : boolean {
    return _branch.ResolveWithFuturePeriods and hasFutureRenewals(promoted)
  }
  
  protected function hasFutureRenewals(promoted : boolean) : boolean {
    var futureRenewals = _branch.FutureRenewals
    return (not futureRenewals.Empty) and futureRenewals.first().Promoted == promoted
  }

  protected function prepareBranchForFinishingJob() {
    _branch.Status = TC_BOUND
    _branch.QuoteHidden = false
  }

  protected function commitBranch(fromProcessNotes : String) {
    try {
      _branch.Bundle.commit()
    } catch (e : Exception) {
      PCLoggerCategory.JOB_PROCESS.error("Unable to " + fromProcessNotes, e)
      throw e
    }
  }

  protected function applyChanges(newBranch : PolicyPeriod) : List<DiffItem> {
    newBranch.applyChangesFromBranch(_branch)

    // checking for duplicates will remove any coverage dupes created by applying the preemption changes
    newBranch.checkForDuplicatesInSlices(newBranch.OOSSlices)

    // If we added objects that need to renumbered, do that here
    newBranch.renumberAutoNumberSequences()

    // Clear denormalized reference dates so they will be correctly re-calculated
    newBranch.clearDenormalizedReferenceDates()

    // if we're applying changes to the branch, syncables should all be in edit - including ones we just applied
    newBranch.AllAccountSyncables.each(\ a -> a.prepareForJobEdit())

    removeApprovalsForPreemption(newBranch)

    return filterDiffsForConflicts(_branch.getDiffItems(DiffReason.TC_APPLYCHANGES), newBranch)
  }

  private function removeApprovalsForPreemption(newBranch : PolicyPeriod) {
    newBranch.expireNextChangeApprovals()

    var preemptedDiffs = _branch.getDiffItems(DiffReason.TC_APPLYCHANGES)
    var preemptingDiffs = newBranch.BasedOn.getDiffItems(DiffReason.TC_APPLYCHANGES)

    removeApprovalsForUWIssueDiffs(preemptedDiffs, newBranch)
    removeApprovalsForUWIssueDiffs(preemptingDiffs, newBranch)
  }

  private function removeApprovalsForUWIssueDiffs(diffs : List<DiffItem>, newBranch : PolicyPeriod) {
    diffs
      .where(\ diff -> diff.Bean typeis UWIssue )
      .each(\ diff -> {
        var diffIssue = diff.Bean as UWIssue
        var newIssue = newBranch.UWIssuesActiveOnly
          .firstWhere(
              \ issue ->
              issue.IssueKey == diffIssue.IssueKey &&
              issue.IssueType == diffIssue.IssueType)
        if (newIssue != null
            && newIssue.Active
            && newIssue.HasApprovalOrRejection
            && !newIssue.Rejected) {
          newIssue.Approval.removeFutureApprovalsOrRejections()
        }
    })
  }

  protected function filterDiffsForConflicts(diffs : List<DiffItem>, newBranch : PolicyPeriod) : List<DiffItem> {
    // Find conflicts, but don't include conflicts that are merge changes
    var conflicts = diffs.where(\ d -> not d.canApplyDiffToBranch(newBranch) and not d.MergeChange).toList()

    // Filter the list for display
    var diffPlugin = Plugins.get(IPolicyPeriodDiffPlugin)
    return diffPlugin.filterDiffItems(DiffReason.TC_APPLYCHANGES, _branch, conflicts)
  }

  /**
   * Initializes a newly created job for a future period based on this job,
   * which is completing for an earlier period. This method is called by
   * PolicyCenter when the new job is created, as part of promoting this job's
   * period. The future job will already have its draft branch attached, with
   * the CancellationDate and Canceled bit set correctly. The OOSJob bit on
   * the job will also be set.
   *
   * @param futureJob  The future job which is started in order to propagate changes from this
   *                   job forward. The future job is guaranteed to be of the same type as this job.
   */
  override function initializeFuturePeriodJob(futureJob : Job) {
    throw new UnsupportedOperationException("Cannot start future jobs of type " + futureJob.DisplayType)
  }

  function setPostUWRequestChanges() {
    //assign current user to initial referrer is it's not set
    if (not AssignmentUtil.isUserRoleInUse(this.Job, TC_INITIALREFERRER)) {
       Job.assignInitialReferrer()
    }

    _branch.EditLocked = true
    if (not _branch.ValidQuote)
      _branch.QuoteHidden = true
  }

  function setPostUWApprovalChanges() {
    if (_branch.mustInvalidateQuoteBeforeReleasingUWEditLock(User.util.CurrentUser.UWAuthorityProfiles)) {
      edit()
    }
    _branch.EditLocked = false
    _branch.QuoteHidden = false

    //unset initial referrer
    var userRoleAssignment = this.Job.RoleAssignments.firstWhere(\ u -> u.Role == TC_INITIALREFERRER)
    if (userRoleAssignment != null)
      this.Job.unassignUserRole(userRoleAssignment.AssignedUser, TC_INITIALREFERRER)
  }

  property get CurrentBlockingPointOfCurrentUser() : UWIssueBlockingPoint {
    return _branch.OOSSlices.reduce(UWIssueBlockingPoint.TC_NONBLOCKING, \ maxBlockingPoint, slice -> {
      var sliceBlockingPoint = slice.UWIssuesActiveOnly
              .issuesBlockingUser(TC_BLOCKSISSUANCE, User.util.CurrentUser.UWAuthorityProfiles).CurrentBlockingPoint
      return sliceBlockingPoint.Priority > maxBlockingPoint.Priority ? sliceBlockingPoint : maxBlockingPoint
    })
  }

  // ===== TERMINAL FUNCTIONS =====

  /**
   * Indicates whether the Job can be expired.
   */
  override function canExpireJob() : boolean {
    return checkExpireJob().Okay
  }

  /**
   * Checks the conditions for which the Job can be expired.
   */
  private function checkExpireJob() : JobConditions {
    var conditions = startChecksFor("expire job").checkJobNotComplete()
    Job.ActivePeriods.each(\ branch -> conditions.append(branch.JobProcess.canExpire()))
    return conditions
  }

  /**
   * Checks the conditions for which the policy period can be expired.
   */
  function canExpire() : JobConditions {
    return startChecksFor("expire")
            .checkStatus({ TC_NEW, TC_DRAFT, TC_QUOTED })
            .checkBranchNotLocked()
  }

  /**
   * Expires all active policy periods in the job, and sets the selected version of the job to
   * the branch from which the expiration was started.
   */
  override function expireJob() {
    checkExpireJob().assertOkay()
    JobProcessLogger.logInfo("Expiring job \"" + Job + "\"")
    Job.ActivePeriods.each(\ branch -> branch.JobProcess.expireWithoutCheckingConditions())
    Job.SelectedVersion = _branch
  }

  /**
   * Expires this policy period, resetting the selected version of the job if needed.
   */
  function expire() {
    canExpire().assertOkay()
    expireWithoutCheckingConditions()
  }

  // useful to eliminate redundant checks because expireJob already check canExpire for each of the branches
  private function expireWithoutCheckingConditions() {
    lockBranchWithStatus(TC_EXPIRED)
  }

  /**
   * Sets the branch status, invalidates the quote and locks the branch. If this was the last
   * active branch in the job, then any open activities on the job are also canceled. Otherwise
   * updates the selected version of the job if needed.
   */
  protected function lockBranchWithStatus(lockedStatus : PolicyPeriodStatus) {
    _branch.Status = lockedStatus
    _branch.markInvalidQuote()
    _branch.lockBranch()
    var activePeriods = Job.ActivePeriods
    if (activePeriods.IsEmpty) {
      this.cancelOpenActivities()
    } else if (Job.SelectedVersion == _branch) {
      Job.SelectedVersion = activePeriods.maxBy(\ p -> p.BranchNumber)
    }
  }

  protected function initializeProducers() {
    var producerCode = Job.Policy.ProducerCodeOfService
    if (producerCode != null) {
      _branch.EffectiveDatedFields.ProducerCode = producerCode
      _branch.ProducerCodeOfRecord = producerCode
    }
  }

  protected function syncProductModel() {
    // Sync computed values as well as all coverages, modifiers, and questions
    _branch.syncComputedValues()
    _branch.syncOffering()
    _branch.syncQuestions()
    _branch.Lines*.AllCoverables.each(\ c -> c.createOrSyncCoverages())
    _branch.AllModifiables.each(\ m -> m.syncModifiers())
    _branch.Lines.each(\l -> l.syncQuestions())
    _branch.PolicyLocations.each(\pl -> pl.syncQuestions())
  }

  /**
   * Check the conditions for which this Job can be withdrawn.  Withdraw may not be allowed
   * due to a number of factors, including status of one or more active branches on the job.
   */
  function canWithdrawJob() : JobConditions {
    var activePeriods = Job.ActivePeriods
    var conditions = startChecksFor("withdraw job")
                      .checkJobNotComplete()
                      .checkCondition(not activePeriods.IsEmpty, "No active periods")
    activePeriods.each(\ branch -> conditions.append(branch.JobProcess.canWithdraw()))
    return conditions
  }

  /**
   * Check the conditions for which this policy period can be withdrawn.
   */
  function canWithdraw() : JobConditions {
    return startChecksFor("withdraw")
            .checkBranchNotLocked()
            .checkWithdrawPermission()
            .checkNotPromoted()
  }

  /**
   * Withdraws all active policy periods in the job, and sets the selected version of the job to
   * the branch from which the withdrawal was started.
   */
  function withdrawJob() {
    canWithdrawJob().assertOkay()
    JobProcessLogger.logInfo("Withdrawing job \"" + Job + "\"")
    Job.ActivePeriods.each(\ branch -> branch.JobProcess.withdrawWithoutCheckingConditions())
    Job.SelectedVersion = _branch
  }

  /**
   * Withdraws this policy period, resetting the selected version of the job if needed.
   */
  function withdraw() {
    canWithdraw().assertOkay()
    withdrawWithoutCheckingConditions()
  }

  /*
   * Can be used to eliminate redundant checks because withdrawJob already checks canWithdraw
   * for each of the branches.
   */
  protected function withdrawWithoutCheckingConditions() {
    JobProcessLogger.logInfo("Withdrawing branch: " + _branch)
    var plugin = Plugins.get(IReinsurancePlugin)
    plugin.withdrawBranch(_branch)
    lockBranchWithStatus(TC_WITHDRAWN)
  }

  /**
   * Withdraws all active branches on the policy except the branch associated with this job.
   * Resets the SideBySide flag if it's set.
   */
  function withdrawOtherActivePeriods() {
    startChecksFor("withdraw other active periods").checkTermNotArchived().assertOkay()
    Job.ActivePeriods.where(\ period -> period != _branch).each(\ period -> period.JobProcess.withdrawWithoutCheckingConditions())
    if (Job.SideBySide) {
      Job.SideBySide = false
    }
    Job.SelectedVersion = _branch
  }

  /**
   * Indicates if billing for this job is subject to a final audit, as is generally the case for canceled policies
   * that are subject to audit.
   */
  property get BillingSubjectToFinalAudit() : boolean {
    return false
  }

  /**
   * Indicates if the depositAmount on reporting plan should be recalculated when a valid quote is generated
   *
   * Currently depositAmount is recalculated during submission, rewrite, renewal, issuance,
   * policy change and reinstatement in WC reporting policies.
   */
  property get RecalculateDepositOnReportingAfterValidQuote() : boolean {
    return false
  }

  /**
   * Send billing instructions to the billing system.
   */
  protected abstract function createBillingEventMessages() // See subtype implementations

  /**
   * Takes this Job to issuance, whatever that means for the specific type of Job.
   *
   * @param bindAndIssue should be true for most jobs, but may be false for (esp Submission) jobs
   * which distinguish bind-only from bind-and-issue.
   */
  protected abstract function issueJob(bindAndIssue : boolean)

  /**
   * Indicates if process is driven by the system.
   */
  property get AutomatedProcess() : boolean {
    return _automatedProcess
  }

  protected property set AutomatedProcess(flag : boolean) {
    _automatedProcess = flag
  }

  /**
   * Discovers all issues with the policy graph based on what the product model allows (availability, etc.).
   * For example, this checks coverages, conditions, exclusions, modifiers, offerings, answers.
   *
   * @param branch the PolicyPeriod to check
   */
  static function checkBranchAgainstProductModel(branch : PolicyPeriod) : List<ProductModelSyncIssueWrapper> {
    var issues = new ArrayList<ProductModelSyncIssueWrapper>()

    // for all coverables across all lines of business on the policy period
    var lines = branch.Lines
    for (line in lines) {
      line.preLoadCoverages()
      for (c in line.AllCoverables) {
        issues.addAll(ProductModelSyncIssueWrapper.wrapIssues(c.checkCoveragesAgainstProductModelwLine(line)))
        issues.addAll(ProductModelSyncIssueWrapper.wrapIssues(c.checkConditionsAgainstProductModelwLine(line)))
        issues.addAll(ProductModelSyncIssueWrapper.wrapIssues(c.checkExclusionsAgainstProductModelwLine(line)))
      }
    }

    for (m in branch.AllModifiables) {
      issues.addAll(ProductModelSyncIssueWrapper.wrapIssues(m.checkModifiersAgainstProductModel()))
    }

    issues.addAll(ProductModelSyncIssueWrapper.wrapIssues(branch.checkOfferingAgainstProductModel()))
    issues.addAll(branch.checkPolicyTermAgainstProductModel())

    // Check answers on the PolicyPeriod, PolicyLines and PolicyLocations
    issues.addAll(ProductModelSyncIssueWrapper.wrapIssues(branch.checkAnswersAgainstProductModel()))
    lines.each(\ l -> issues.addAll(ProductModelSyncIssueWrapper.wrapIssues(l.checkAnswersAgainstProductModel())))
    branch.PolicyLocations.each(\ l -> issues.addAll(ProductModelSyncIssueWrapper.wrapIssues(l.checkAnswersAgainstProductModel())))

    return issues
  }

  /**
   * Performs the given action as the specified user, for use during automated
   * processing where the system is acting on a user's behalf.
   *
   * @param user the User to act as
   * @param action() the action to take
   */
  protected function executeAsAutomatedUser(user : User, action()) {
    executeAsIdentifiedUser(user.ID, action)
  }

  private function executeAsSuperUser(action()) {
    var superUserID =
      PLDependenciesGateway.getSuperUserIdentifier().getSystemServicesUserId()
    executeAsIdentifiedUser(superUserID, action)
  }

  /**
   * Performs the given action as the user specified by ID.
   *
   * @param userID The identifier of the user to act as
   * @param action() the action to take
   */
  private function executeAsIdentifiedUser(userID : Key, action()) {
    var oldToken = PLDependenciesGateway.getCommonDependencies().getServiceToken()
    var newToken = PLDependenciesGateway.getServiceTokenManager().createAuthenticatedToken(userID)
    var oldAutomatedProcessValue = this.AutomatedProcess
    try {
      this.AutomatedProcess = true
      PLDependenciesGateway.getCommonDependencies().setServiceToken(newToken)
      action()
    } finally {
      this.AutomatedProcess = oldAutomatedProcessValue
      PLDependenciesGateway.getCommonDependencies().setServiceToken(oldToken)
      PLDependenciesGateway.getServiceTokenManager().removeToken(newToken);
    }
  }

  function setPaymentInfoWithNewQuote() {
    if (_branch.ReportingPlanSelected) {
      _branch.WaiveDepositChange = false
      if (RecalculateDepositOnReportingAfterValidQuote) {
        _branch.calculateAndSetDepositAmountOnReporting()
      }
    }
  }

  /**
  * Callback for JobProcess class to perform clean-up actions. Used OOTB to remove selected payment plan
  * in NewTermProcess.
  */
  function cleanUpAfterEdit() {
    // Do nothing
  }

  /**
   * Gets installment plan preview from the billing system.
   *
   * @return PaymentPreviewItem[]
   */
  function retrieveInstallmentsPlanPreviewFromBillingSystem() : PaymentPreviewItem[] {
    JobProcessLogger.logInfo("Retrieving installments plan previews from Billing System, branch: " + _branch)
    var plugin = Plugins.get(IBillingSystemPlugin)
    JobProcessLogger.logDebug("Current Plugin definition ${plugin}")
    return plugin.retrieveInstallmentsPlanPreview(_branch)
  }

  /**
   * Releases quote that is hidden if all issues that are blocking quote release have been approved
   * or are auto-approvable by the current user.
   */
  function attemptQuoteReleaseForNonprivilegedUser() {
    QuoteProcess.attemptQuoteReleaseForNonprivilegedUser()
  }

  protected function bindReinsurableRisks() {
    var plugin = Plugins.get(IReinsurancePlugin)
    plugin.bindBranch(_branch)
  }
  
  /**
   * Callback method to enable customization of any actions that have to happen pre-quote, i.e. RIGHT before the requestQuote fires.
   */
  protected function runPreQuote() {}
}
