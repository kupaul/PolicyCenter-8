package gw.policy

uses gw.api.database.DBFunction
uses gw.api.database.Query
uses gw.api.diff.DiffItem
uses gw.api.effdate.EffDatedFinderUtil
uses gw.api.effdate.UniqueOnPolicyPeriod
uses gw.api.productmodel.PolicyLinePattern
uses gw.api.productmodel.OfferingLookup
uses gw.api.util.DisplayableException
uses gw.api.util.LocaleUtil
uses gw.api.web.document.DocumentsHelper
uses gw.api.web.productmodel.ProductModelSyncIssue
uses gw.api.web.productmodel.UnavailablePolicyTermIssue
uses gw.assignment.AssignmentUtil
uses gw.document.DocumentProduction
uses gw.job.audit.ComputedReportingTrendSynopsis
uses gw.job.audit.PersistedReportingTrendSynopsis
uses gw.job.audit.ReportingTrendSynopsis
uses gw.job.JobProcess
uses gw.job.SubmissionProcess
uses gw.job.AuditProcess
uses gw.job.CancellationProcess
uses gw.job.IssuanceProcess
uses gw.job.PolicyChangeProcess
uses gw.job.ReinstatementProcess
uses gw.job.RenewalProcess
uses gw.job.RewriteNewAccountProcess
uses gw.job.RewriteProcess
uses gw.lob.common.SideBySideUtil
uses gw.losshistory.ClaimSearchCriteria
uses gw.plugin.account.IAccountPlugin
uses gw.plugin.contact.IContactConfigPlugin
uses gw.plugin.Plugins
uses gw.validation.PCValidationContext
uses gw.validation.ValidationUtil
uses gw.web.productmodel.ProductModelSyncIssueWrapper
uses java.lang.IllegalStateException
uses java.lang.Double
uses java.util.ArrayList
uses java.util.Collections
uses java.util.Date
uses java.util.HashMap
uses java.util.HashSet
uses java.util.Map
uses java.util.Set
uses org.apache.commons.lang.StringUtils
uses gw.reinsurance.risk.RiskData
uses gw.api.util.JurisdictionMappingUtil
uses gw.api.util.DateUtil
uses gw.api.util.MonetaryAmounts
uses gw.lob.common.DefaultSegmentEvaluator
uses gw.lob.common.SegmentEvaluator
uses gw.plugin.reinsurance.IReinsuranceConfigPlugin
uses java.text.DateFormat
uses gw.api.system.PCLoggerCategory

enhancement PolicyPeriodBaseEnhancement : PolicyPeriod {
  /**
   * Determines the string to display for {@link #PolicyNumber}
   * @return our {@link #PolicyNumber} if assigned or a localized "Unassigned" label otherwise
   */
  public property get PolicyNumberDisplayString(): String {
    return this.PolicyNumberAssigned ? this.PolicyNumber : displaykey.EntityName.PolicyPeriod.PolicyNumber.Unassigned
  }

  /**
   * Determines whether a policy number has been assigned to this period
   * @return true if a policy number has been assigned to this period, false otherwise
   */
  public property get PolicyNumberAssigned(): boolean {
    return this.PolicyNumber <> null
  }

  property get FinalAuditOption() : typekey.FinalAuditOption {
    return this.PolicyTerm.FinalAuditOption
  }

  property set FinalAuditOption(option : typekey.FinalAuditOption) {
    this.PolicyTerm.FinalAuditOption = option
  }

  property get AllCoverables() : Coverable[] {
    return this.Lines*.AllCoverables
  }

  property get AllModifiables() : Modifiable[] {
    var modifiables = this.Lines*.AllModifiables.toList()
    modifiables.add(this.EffectiveDatedFields)
    return modifiables.toTypedArray()
  }

  property get LinePatterns(): gw.api.productmodel.PolicyLinePattern[] {
    return this.Lines.map(\ line -> line.Pattern)
  }

  property get MultiLine() : boolean {
    return this.Policy.Product.LinePatterns.Count > 1
  }

  property get UnderWriterIssueBlockingPoint() : UWIssueBlockingPoint {
    switch (true) {
      case this.Status == "Bound" :
        return "NonBlocking"

      case this.ValidQuote and !this.QuoteHidden :
        return "BlocksBind"

      case this.ValidQuote and this.QuoteHidden :
        return "BlocksQuoteRelease"

      default :
        return "BlocksQuote"
    }
  }

  /**
   * Returns the string status of the period as of the current date in effective time.
   * This is useful for looking at the "bound view" of Policies, i.e. in the
   * Policy File, Account File, etc.
   */
  property get PeriodDisplayStatus() : String {
    return PolicyPeriod.getPeriodDisplayStatus(DateUtil.currentDate(), this.Status, this.CancellationDate, this.PeriodStart, this.PeriodEnd)
  }

  /**
   * Returns true if the PolicyPeriod can be edited by the current user.
   * This always returns false if the PolicyPeriod is not part of a Job or
   * if it has any unhandled preemptions. Otherwise, this method chains to a
   * Gosu class {@link com.guidewire.pc.system.rule.PCGosuFunctionNames#IS_OPEN_FOR_EDIT}.
   *
   * @see #hasAnyUnhandledPreemptions()
   */
  property get OpenForEdit() : boolean {
    return checkBaseEditability() and this.Job?.isOpenForEdit(this)
  }

  /**
   * Returns true if the current policy period is the selected version for the current job
   */
  property get Selected() : boolean {
    return this.Job?.SelectedVersion == this
 }

  function checkBaseEditability() : boolean {
    var job = this.Job

    // Cannot edit a period if it has no corresponding job
    if (job == null) {
      PCLoggerCategory.JOB_PROCESS.debug("checkBaseEditability() - FALSE: NULL Job")
      return false
    }

    // Cannot edit a policy period that has unhandled preemptions
    if (this.hasAnyUnhandledPreemptions()) {
      PCLoggerCategory.JOB_PROCESS.debug("checkBaseEditability() - FALSE: Has unhandles preemptions")
      return false
    }

    // Unprivileged users cannot edit a PolicyPeriod under UW EditLock
    if (UWLockedAndNoOverride) {
      PCLoggerCategory.JOB_PROCESS.debug("checkBaseEditability() - FALSE: UWLocked and No Override")
      return false
    }

    // No editing in the wrong OOSE slice unless you are trying to fix failed oose validation or
    // you're Side-by-Side
    var wrongSlice = this.SliceDate == null or not this.FirstOOSSliceDateRange.includes(this.SliceDate)
    if (wrongSlice and not this.FailedOOSEValidation) {
      PCLoggerCategory.JOB_PROCESS.debug("checkBaseEditability() - FALSE: wrong slice and not a Failed OOS validation")
      return false
    }
    return true
  }

  property get UWLocked() : boolean {
    if (this.Job.SideBySide) {
      return SideBySideUtil.getSideBySidePeriods(this).hasMatch(\p -> p.EditLocked)
    } else {
      return this.EditLocked
    }
  }

  property get UWLockedAndNoOverride() : boolean {
    return !perm.System.editlockoverride and UWLocked
  }

  /**
   * Returns true if an element should be editable in the context of Side-by-Side.
   * Specifically, Side-by-Side should allow editability when the job is in submission or change
   * state and is Quoted.
   * This always returns false if the PolicyPeriod is not part of a Job or
   * if it has any unhandled preemptions.
   */
  property get AvailableForSideBySideEdit() : boolean {
    return checkBaseEditability() and this.Job?.isAvailableForSideBySideEdit(this)
  }

  /**
   * Returns a list of strings that describe how this PolicyPeriod relates
   * to other Periods in the same Policy. This is useful for UI
   * purposes, such as for annotating the PolicyFile.
   */
  property get PolicyFileMessages() : List<String> {
    var messages = new ArrayList<String>()

    // add messages here

    return messages
  }

  private property get ActiveTimeoutWorkflows() : TimeoutWF[] {
    return this.getWorkflows().whereTypeIs(TimeoutWF).where(\ workflow -> workflow.State == WorkflowState.TC_ACTIVE)
  }

  property get JobProcess() : JobProcess {
    return this.JobProcessInternal as JobProcess
  }

  property get AuditProcess() : AuditProcess {
    return JobProcess as AuditProcess
  }

  property get CancellationProcess() : CancellationProcess {
    return JobProcess as CancellationProcess
  }

  property get IssuanceProcess() : IssuanceProcess {
    return JobProcess as IssuanceProcess
  }

  property get PolicyChangeProcess() : PolicyChangeProcess {
    return JobProcess as PolicyChangeProcess
  }

  property get ReinstatementProcess() : ReinstatementProcess {
    return JobProcess as ReinstatementProcess
  }

  property get RenewalProcess() : RenewalProcess {
    return JobProcess as RenewalProcess
  }

  property get RewriteProcess() : RewriteProcess {
    return JobProcess as RewriteProcess
  }

  property get RewriteNewAccountProcess() : RewriteNewAccountProcess {
    return JobProcess as RewriteNewAccountProcess
  }

  property get SubmissionProcess() : SubmissionProcess {
    return JobProcess as SubmissionProcess
  }

  property get FormsDiffItems() : List<DiffItem> {
    return this.getDiffItems(DiffReason.TC_INTEGRATION)
  }

  property get PolicyReviewDiffItems() : List<DiffItem> {
    return this.getDiffItems(DiffReason.TC_POLICYREVIEW)
  }

  property get PolicyProductRoot() : PolicyProductRoot {
    return new PolicyProductRoot(this.Bundle) {
      :Account = this.Policy.Account,
      :EffDate = this.PeriodStart,
      :WrittenDate = this.WrittenDate,
      :Producer = this.ProducerCodeOfRecord.Organization,
      :ProducerCode = this.ProducerCodeOfRecord,
      :State = this.BaseState,
      :JobType = this.Job.Subtype,
      :UWCompany = this.UWCompany
    }
  }
  
  function countLocationsInState(state: State): int {
    return this.PolicyLocations.countWhere(\ loc -> loc.State == state)
  }

  /**
   * Like the PeriodDisplayStatus property, but takes the "current date" as an argument
   * along with the various PolicyPeriod fields.  This allows us to invoke the same method
   * where we don't actually have a PolicyPeriod.
   */
  public static function getPeriodDisplayStatus(asOf : Date, periodStatus : PolicyPeriodStatus,
                                                cancellationDate : Date, periodStart : Date, periodEnd : Date) : String {
    if (periodStatus != "Bound") {
      return periodStatus.DisplayName
    } else if (cancellationDate != null) {
      return displaykey.PolicyPeriod.PeriodDisplayStatus.Canceled
    } else if (asOf < periodStart) {
      return displaykey.PolicyPeriod.PeriodDisplayStatus.Scheduled
    } else if (asOf >= periodEnd) {
      return displaykey.PolicyPeriod.PeriodDisplayStatus.Expired
    } else {
      return displaykey.PolicyPeriod.PeriodDisplayStatus.InForce
    }
  }

  /**
   * Returns a list of account locations that are not assigned to the locations of this policy period
   * and are active
   */
  function getUnassignedAccountLocations(): List<AccountLocation> {
    var assignedLocations = this.PolicyLocations.map(\ loc -> loc.AccountLocation)
    var locs = this.Policy.Account.ActiveAccountLocations.toSet().subtract(assignedLocations.toSet())
    return locs.toList()
  }

  /**
   * Create policy locations for all account locations in the list
   */
  function addLocations(locations: List<AccountLocation>) {
    for (loc in locations) {
      this.newLocation(loc)
      if (this.WorkersCompLineExists and this.WorkersCompLine.getJurisdiction(JurisdictionMappingUtil.getJurisdiction(loc)) == null) {
        this.WorkersCompLine.addJurisdiction(JurisdictionMappingUtil.getJurisdiction(loc))
      }
    }
  }

  function runSegmentationRules() {
    var evaluators = getSegmentEvaluators()
    for (evaluator in evaluators) {
        if(evaluator.IsHighRisk) {
            this.Segment = "high"
            return
        }
    }

    for (evaluator in evaluators) {
        if(evaluator.IsMediumRisk) {
            this.Segment = "med"
            return
        }
    }

    this.Segment = "low"
  }

  private function getSegmentEvaluators() : Set<SegmentEvaluator> {
    var evaluators : Set<SegmentEvaluator> = {new DefaultSegmentEvaluator(this)}
    for (line in this.Lines) {
      var evaluator = line.createSegmentEvaluator(this)
      if (evaluator != null) {
        evaluators.add(evaluator)
      }
    }
    return evaluators
  }

  function runSubmissionIssuanceLogic() {
    this.Job.createCustomHistoryEvent(TC_SUB_ISSUED, \ -> displaykey.Submission.History.JobIssued)
    ensureProducerOfService()
    ensureProducerOfRecord()
  }

  function edit() {
    this.Status = "Draft"
    this.markInvalidQuote()
    for (slice in this.OOSSlices) {
      for (issue in slice.UWIssuesIncludingSoftDeleted.where(\ issue -> issue.HasApprovalOrRejection  and not issue.Approval.EditBeforeBind) ) {
        issue.reopenWithAutomaticCause("reopened on edit")
      }
    }
    // reset the denorm fields
    this.TotalCostRPT = null
    this.TotalPremiumRPT = null
    this.TransactionCostRPT = null
    this.TransactionPremiumRPT = null
    this.QuoteHidden = false  //quote is never hidden in draft
    this.AllAccountSyncables.each(\ a -> a.prepareForJobEdit())
    // clear selected payment plan -- allows quote process to update billing correctly.
    this.JobProcess.cleanUpAfterEdit()
  }


  /**
   * Determines if the PeriodStart and PeriodEnd can be changed on the PolicyPeriod.
   * It can be changed if:
   * <ul>
   * <li>The PolicyPeriod is in "Draft" or "New"
   * <li>The PolicyPeriod is on a job that can update the period dates
   * <li>The PolicyPeriod has only one PolicyPeriod
   * </ul>
   *
   * @return true if all the items in the above list are true; false otherwise
   */
  property get CanUpdatePeriodDates() : boolean {
    return not this.Promoted and this.Job?.CanUpdatePeriodDates and (this.Status == "New" or this.Status == "Draft")
  }

  /**
   * Determines if the Copy Coverage can be performed on the PolicyPeriod.
   * It can be changed if:
   * the period is on a job that can copy coverages
   * and period is either draft or new status
   */
  property get CanCopyCoverages() : boolean {
    return this.Job?.CanCopyCoverages and (this.Status == "New" or this.Status == "Draft")
  }

  function getNewClaimSearchCriteria(useThisPolicy : boolean) : ClaimSearchCriteria {
    var criteria = new ClaimSearchCriteria()
    criteria.DateCriteria.StartDate = Date.Today.addYears(-1)
    criteria.DateCriteria.EndDate = Date.Today
    criteria.DateCriteria.DateSearchType = DateSearchType.TC_ENTEREDRANGE
    if (useThisPolicy) {
      criteria.Policy = this.Policy
    }
    return criteria
  }

  /**
   * Ensures that the producer of service is set. This should normally be called only
   * by rules that are dealing with an bound policy at issue time.  It assumes that
   * the current period is latest in model time.
   */
  function ensureProducerOfService() {
    var p = this.Policy
    if (p.ProducerCodeOfService != this.EffectiveDatedFields.ProducerCode) {
      p.ProducerCodeOfService = this.EffectiveDatedFields.ProducerCode
      ensureProducerIsValid()
    }

    ensureProducerOfServiceFromAccount()
  }

  /**
   * When the ProducerOfService changes, it may impact the validity of the current
   * Producer.  If the Producer becomes obsolete, they must be changed.
   */
  private function ensureProducerIsValid() {
    var producer = this.Job.getUserRoleAssignmentByRole("Producer")

    // If the producer is not null and they are no longer valid for the ProducerCode,
    // then they must be updated
    if (producer != null && not this.Policy.ProducerCodeOfService.isAvailableFor(producer.AssignedUser)) {
      this.Job.removeFromRoleAssignments(producer)
      this.Job.assignProducer()

      // If the Policy has the same invalid user, switch them too
      var policyProducer = this.Policy.getUserRoleAssignmentByRole("Producer")
      if (producer.AssignedUser == policyProducer.AssignedUser) {

        this.Policy.removeFromRoleAssignments(policyProducer)
        var newProducer = this.Job.getUserRoleAssignmentByRole("Producer")
        AssignmentUtil.assignAndLogUserRole(this.Policy, newProducer.AssignedUser, newProducer.AssignedGroup, "producer",
                                           "PolicyPeriodBaseEnhancement.ensureProducerIsValid()")
      }
    }
  }

  /**
   * Ensures that the producers are set. This should normally be called only by rules that
   * are dealing with an bound policy at issue time.
   */
  private function ensureProducerOfServiceFromAccount() {
    var desiredCodes = calculateDesiredProducerCodes()

    // Remove producer codes that are not wanted
    var account = this.Policy.Account
    for (accountCode in account.ProducerCodes) {
      if (not desiredCodes.remove(accountCode.ProducerCode)) {
        account.removeFromProducerCodes(accountCode)
      }
    }

    // Add desired producer codes that are not already on the account
    for (pc in desiredCodes) {
      var accountCode = new AccountProducerCode(account)
      accountCode.ProducerCode = pc as ProducerCode
      account.addToProducerCodes(accountCode)
    }
  }

  /**
   * Calculates the desired producer codes based on the idea that an account's producer codes are
   * the collection of producer of service from its policies.
   */
  private function calculateDesiredProducerCodes() : Set {
    var newPCs = new HashSet<ProducerCode>()
    var pc = this.Policy.ProducerCodeOfService
    if (pc != null) {
      newPCs.add(pc)
    }
    var account = this.Policy.Account
    for (prSum in account.IssuedPolicies) {
      if (prSum.PolicyNumber != this.PolicyNumber) {
        pc = prSum.ProducerCodeOfService
        if (pc != null) {
          newPCs.add(pc)
        }
      }
    }
    for (job in account.getAllJobs(false, null, null, null)) {
      if (not job.equals(this.Job)) {
        var period = job.LatestPeriod
        pc = period.Policy.ProducerCodeOfService
        if (pc != null) {
          newPCs.add(pc)
        }
      }
    }
    return newPCs
  }

  /**
   * Ensures that the producer of record is set. It should normally be called only
   * by rules that are dealing with an bound policy at issue time.  Also, since the producer of record
   * is only set on the initial period, that it only needs to be set on those jobs that create new
   * revsions.  It assumes that the producer of record is not set until then.
   */
  function ensureProducerOfRecord() {
    this.ProducerCodeOfRecord = this.EffectiveDatedFields.ProducerCode
  }

  /**
   * A PolicyPeriod is reserved if its Account already has an Issued, non-canceled
   * PolicyPeriod for that Product which is effective today but is associated with
   * a different ProducerCode.
   */
  function isRiskReserved() : boolean{
    var plugin = Plugins.get(IAccountPlugin)
    return plugin.isRiskReserved(this)
  }

  /**
   * Returns warning strings to be displayed in the wizard of jobs. An empty string is
   * returned if no warning is necessary.
   */
  function getWizardWarningMessages() : List<String> {
    var result = new ArrayList<String>()
    if (this.hasAnyUnhandledPreemptions() and not this.Locked) {
      var jobs = this.PreemptionsOfThisPeriod.map(\ r -> r.Job.DisplayType + " " + r.Job.JobNumber).join(", ")
      result.add(displaykey.Web.Job.Preempted.Warning(this.Job.DisplayType, jobs))
    }

    // Only display this message if the branch is still active (not locked)
    if (this.Job.OOSJob and not this.Locked) {
      if (this.Canceled and this.EditEffectiveDate.before(this.CancellationDate)) {
        // Special message if canceled in future
        var dateStr = this.CancellationDate.format("short")
        result.add(displaykey.Web.Job.OOS.CancelWarning(this.Job.DisplayType, dateStr))
      } else {
        var oosDates = this.OOSSliceDates.where(\ d -> d.after(this.EditEffectiveDate)).map(\ d -> d.format("short")).join(", ")
        result.add(displaykey.Web.Job.OOS.Warning(this.Job.DisplayType, oosDates))
      }
    }

    if (this.FailedOOSEValidation) {
      result.add(displaykey.Web.Job.OOS.OOSEValidationWarning)
    } else if (this.FailedOOSEEvaluation) {
      result.add(displaykey.Web.Job.OOS.OOSEEvaluationWarning)
    }

    if (this.Job typeis Renewal) {
      if(this.Renewal.hasAnotherPendingPeriod(this)){
        result.add(displaykey.Web.RenewalWizard.OtherPeriod.Message)
      }
      var prevTermChanged = this.Policy.Periods
        .hasMatch(\ p -> p.ResolveWithFuturePeriods and this.BasedOn.TermNumber == p.TermNumber)
      if(prevTermChanged){
        result.add(displaykey.Web.RenewalWizard.PriorTerm.Message)
      }
    }

    // Warn if this period has a Quoted Cancellation job AND there's already another one scheduled.
    if (this.Cancellation != null and
        !this.CancellationProcess.CurrentNotificationsSent and this.ValidQuote and !this.Locked) {
      var scheduledCancellation = this.Policy.OpenJobs.whereTypeIs(Cancellation).firstWhere(\ c -> c.PolicyPeriod.CancellationProcess.CurrentNotificationsSent)
      if (scheduledCancellation != null) {
        result.add(displaykey.Web.Cancellation.Error.AlreadyScheduled(scheduledCancellation.JobNumber))
      }
    }
    return result
  }

  /**
   * Creates a new note on the given PolicyPeriod with the given values
   * for the note topic, subject and body.
   */
  function addNote(topic : NoteTopicType, subject : String, body : String) {
    var note = this.newNote()
    note.Subject = subject
    note.Body = body
    note.Topic = topic
  }

  function getWizardQuoteScreenWarnings() : List<String> {
    var result : List<String> = {}

    result.addAll(getProbablyObsoleteWarnings())

    if ((perm.System.viewratingoverrides or perm.System.editratingoverrides) and this.hasAtLeastOneCostOverride()) {
      result.add(displaykey.Web.QuoteScreen.HasOverridesWarning)
    }

    result.addAll(getWizardWarningMessages())

    var futureBlockingPoint = this.JobProcess.CurrentBlockingPointOfCurrentUser
    result.addAll(futureBlockingPoint.QuoteScreenFutureIssuesWarnings)

    return result
  }

  private function getProbablyObsoleteWarnings() : List<String> {
    if (not this.ValidQuote and this.Status == "Declined") {
      return {displaykey.Web.SubmissionWizard.Quote.SubmissionRejected(this.Job.DisplayStatus.toLowerCase())}
    } else if (not this.ValidQuote and this.Job.Complete) {
      return {displaykey.Web.SubmissionWizard.Quote.Completed(this.Status)}
    }
    return Collections.emptyList<String>()
  }

  function startWorkflow(workflowSubtype : typekey.Workflow) {
    this.createActiveWorkflow(workflowSubtype).start()
  }

  function startWorkflowAsynchronously(workflowSubtype : typekey.Workflow) {
    this.createActiveWorkflow(workflowSubtype).startAsynchronously()
  }

  function createTimeoutWorkflow(wakeupTime: Date, functionToCall: String) : TimeoutWF {
    var workflow = this.createWorkflow("TimeoutWF") as TimeoutWF
    // If there isn't an active workflow set this as the active workflow.
    if (this.ActiveWorkflow == null) {
      this.ActiveWorkflow = workflow
    }
    workflow.FunctionToCall = functionToCall
    workflow.WakeupTime = wakeupTime
    return workflow
  }

  function cancelTimeout() {
    ActiveTimeoutWorkflows.each(\ workflow -> workflow.invokeTrigger("Cancel"))
  }

  /**
   * Auto selects an underwriting company with the best price that is valid
   * for the states on the policy and that has the appropriate risk level
   */
  // tests in UWCompaniesTest
  // side-effect of UWCompanyBuilderTest.testDefaults covers
  //    Segment priorities logic...
  function autoSelectUWCompany() {
    // Get a set of available companies (independent of segment)
    var availableUWCompanies = this.getUWCompaniesForStates(true)

    // If the current UWCompany is non-null and is still available, do nothing
    if (this.UWCompany != null and availableUWCompanies.contains(this.UWCompany)) {
      return
    }

    if ( availableUWCompanies.Empty ) {
      this.UWCompany = null
      return
    }

    var possibleBest = availableUWCompanies.toArray(new UWCompany[availableUWCompanies.Count])
    // For all available companies, find the one with the best price that
    // matches the following conditions:
    //   - It's effective for the period for the base state and policy product
    //   - Its segment priority is less than or equal to the period's segment's
    var qry = makeLicensedStateQuery(possibleBest)
    qry.subselect("PriceFactor", CompareIn/*Equals*/,
      makeLicensedStateQuery(possibleBest),
      DBFunction.Min(LicensedState, "PriceFactor"))
    var bestCompanyId = qry.select(\ t -> t.UWCompany.ID).FirstResult

    /* Even though we have available companies, we may not
     * have one that matches for price for the _segment_!
     */
    this.UWCompany = ( bestCompanyId != null )
      ? availableUWCompanies.singleWhere(\ uwc -> uwc.ID == bestCompanyId)
      : null
  }

  private function makeLicensedStateQuery(uwCompanies : UWCompany[]) : Query<LicensedState> {
    // Construct a query for the licensed states of all available underwriting
    // companies such that:
    //   - It's effective for the period for the base state and policy product
    //   - Its segment priority is less than or equal to the period's
    var qry = Query.make(LicensedState)

    qry.compareIn("UWCompany", uwCompanies)

    EffDatedFinderUtil.addRestrictionsForEffectiveOnDate(qry, this.PeriodStart)

    qry.compare("State", Equals, this.BaseState)
    qry.compare("ProductCode", Equals, this.Policy.Product.Code)
    // Assumes the segment priority is equal to the segment ID so
    // that the latter can be used to order them by priority...
    //qry.compare("Segment", LessThanOrEquals, this.Segment)
    // if not use the following...
    qry.compareIn("Segment", Segment.getTypeKeys(false)
      .where(\ seg -> seg.Priority >= this.Segment.Priority).toArray())

    return qry
  }

  /**
   *  Returns the rate factor for the given date and state, based on the current underwriting company
   */
  function getUWCompanyRateFactor(ratingEffectiveDate : Date, state : Jurisdiction) : Number {
    // Map: (UWCompany.PublicID, Product.Code, State, Date) -> PriceFactor
    // NOTE: It's important that this is a "session" var so it's value is preserved
    // across calls to this function within the same user session.
    var priceFactorCache session : Map

    // Initialize the cache if necessary
    if (priceFactorCache == null) {
      priceFactorCache = new HashMap()
    }

    // Set some useful values
    var comp = this.UWCompany
    var product = this.Policy.Product.Code

    // See if the factor is already in the cache.  If so, return it.
    var key = comp.PublicID + "," + product + "," + state + "," + ratingEffectiveDate
    var priceFactor = priceFactorCache.get(key) as Number
    if (priceFactor != null) {
      return priceFactor
    }

    // If not in the cache, find it...
    var licensedStatesQuery = Query.make(LicensedState)
      .compare(LicensedState#UWCompany.PropertyInfo.Name, Equals, comp)
      .compare(LicensedState#State.PropertyInfo.Name, Equals, state)
      .compare(LicensedState#ProductCode.PropertyInfo.Name, Equals, product)
      .compare(LicensedState#EffectiveDate.PropertyInfo.Name, LessThanOrEquals, ratingEffectiveDate)
      .or(\ restriction -> {
        restriction.compare(LicensedState#ExpirationDate.PropertyInfo.Name, Equals, null)
        restriction.compare(LicensedState#ExpirationDate.PropertyInfo.Name, GreaterThan, ratingEffectiveDate)
      }).select()
    
    var queryIterator = licensedStatesQuery.iterator()
    if (not queryIterator.hasNext()) {
      // no licensedStates were found, so warn and return 1 by default
      PCLoggerCategory.JOB_PROCESS.warn(displaykey.PolicyPeriod.UWCompany.NoLicensedStates(comp.DisplayName, product, state, ratingEffectiveDate))
      priceFactor = 1
    } else {
      var licensedState = queryIterator.next()
      if (queryIterator.hasNext()) {
        // warn that this should not happen and throw exception to the UI
        var errMsg = displaykey.PolicyPeriod.UWCompany.MultipleApplicableRatingFactors(comp.DisplayName, product, state, ratingEffectiveDate)
        PCLoggerCategory.JOB_PROCESS.error(errMsg)
        // Note: a customer *could* comment out this exception, but we recommend against it.
        throw new DisplayableException(errMsg)
      }
      priceFactor = licensedState.PriceFactor as double
    }

    // cache and return the priceFactor
    priceFactorCache.put(key, priceFactor)
    return priceFactor
  }

  /* This is used to choose a useful address from the policy or account in order to do assignment based on
     location in assignment rules.
   */
  function getAddressForAssignment() : Address {
    var addr : Address

    // First, try to use the policy address
    if (this.PolicyAddress.Address != null) {
      addr = this.PolicyAddress.Address
    }
    // Next, try to use the address of the primary named insured
    if (this.PrimaryNamedInsured.AccountContactRole.AccountContact.Contact.PrimaryAddress != null) {
      addr = this.PrimaryNamedInsured.AccountContactRole.AccountContact.Contact.PrimaryAddress
    }
    // Next, try to use the account's address
    else if (this.Policy.Account.AccountHolderContact.PrimaryAddress != null) {
      addr = this.Policy.Account.AccountHolderContact.PrimaryAddress
    }
    // Finally, use the address of the primary location
    else if (this.PrimaryLocation != null) {
      // Need to copy Location data into a true address entity to pass to the assignment method
      addr = new Address()
      addr.AddressLine1 = this.PrimaryLocation.AddressLine1
      addr.City = this.PrimaryLocation.City
      addr.State = this.PrimaryLocation.State
      addr.PostalCode = this.PrimaryLocation.PostalCode
      addr.Country = this.PrimaryLocation.Country
    }

    return addr
  }

  /**
   * Run this to do everything, including validation against the product model. Expensive.
   */
  function validatePeriod(level : ValidationLevel) : PCValidationContext {
    var context = ValidationUtil.createContext(level)
    var val = new PolicyPeriodValidation(context, this)
    val.validate()
    return context
  }

  /**
  * Binds autonumber sequences. Account LocationAutoNumberSeq should not be bound.
  */
  function cloneAutoNumberSequences() {
    cloneLocationAutoNumberSeq()
    for(var line in this.Lines) {
      line.cloneAutoNumberSequences()
    }
  }

  /**
  * Resets autonumber sequences. Account LocationAutoNumberSeq should not be reset.
  */
  function resetAutoNumberSequences() {
    resetLocationAutoNumberSeq()
    for(var line in this.Lines) {
      line.resetAutoNumberSequences()
    }
  }

  /**
  * Binds autonumber sequences. Account LocationAutoNumberSeq
   not be bound.
  */
  function bindAutoNumberSequences() {
    bindLocationAutoNumberSeq()
    for(var line in this.Lines) {
      line.bindAutoNumberSequences()
    }
  }

  /**
   * Finds new sequenced beans to renumber, called after changes have been
   * applied to a branch, e.g. from preemption or apply a PolicyChange to
   * a future period.
   */
  function renumberAutoNumberSequences() {
    renumberNewLocations()
    for(var line in this.Lines) {
      line.renumberAutoNumberSequences()
    }
  }

  function cloneLocationAutoNumberSeq() {
    this.LocationAutoNumberSeq = this.LocationAutoNumberSeq.clone(this.Bundle)
  }

  function resetLocationAutoNumberSeq() {
    this.LocationAutoNumberSeq.reset()
    renumberLocations()
  }
  
  function bindLocationAutoNumberSeq() {
    renumberLocations()
   this.LocationAutoNumberSeq.bind(this.getCurrentAndFutureLocations(), PolicyLocation.Type.TypeInfo.getProperty("LocationNum"))
  }

  function renumberLocations() {
    this.LocationAutoNumberSeq.renumber(this.getCurrentAndFutureLocations(), PolicyLocation.Type.TypeInfo.getProperty("LocationNum"))
  }

  function renumberNewLocations() {
    this.LocationAutoNumberSeq.renumberNewBeans(this.getCurrentAndFutureLocations(), PolicyLocation.Type.TypeInfo.getProperty("LocationNum"))
  }

  /**
   * We're not clearing PolicyChanges - they can still apply those.
   * Not sure why they would, but they can?
   */
  function clearOutstandingCancellationsOrReinstatementsInSamePeriod() {
    var periods = this.Policy.Periods
    for (period in periods) {
      if (period.PeriodId == this.PeriodId &&
        (period.Job typeis Cancellation or period.Job typeis Reinstatement) &&
        period.ResolveWithFuturePeriods) {
        period.clearResolveWithFuturePeriods()
      }
    }
  }

  /**
   * Returns a message to display in the JobComplete.pcf page, based on the PolicyPeriod's Status
   * and the Job.
   */
  property get JobCompletionMessage() : String {
    switch(this.Status) {
      case "Withdrawn"    : return displaykey.Web.JobComplete.Message.Withdrawn(this.Job.DisplayType, this.Job.JobNumber)
      case "Declined"     : return displaykey.Web.JobComplete.Message.Declined(this.Job.DisplayType, this.Job.JobNumber)
      case "NotTaking"    : return displaykey.Web.JobComplete.Message.NotTaking(this.Job.JobNumber)
      case "NotTaken"     : return displaykey.Web.JobComplete.Message.NotTaken(this.Job.DisplayType, this.Job.JobNumber)
      case "Binding"      : return displaykey.Web.JobComplete.Message.Binding(this.Job.DisplayType, this.Job.JobNumber)
      case "Bound"        : return displaykey.Web.JobComplete.Message.Bound(this.Job.DisplayType, this.Job.JobNumber)
      case "Reinstating"  : return displaykey.Web.JobComplete.Message.Reinstating(this.Job.DisplayType, this.Job.JobNumber)
      case "NonRenewing"  : return displaykey.Web.JobComplete.Message.NonRenewing(this.Job.JobNumber)
      case "NonRenewed"   : return displaykey.Web.JobComplete.Message.NonRenewed(this.Job.JobNumber)
      case "Renewing"     : return displaykey.Web.JobComplete.Message.Renewing(this.Job.JobNumber)
      case "Rescinded"    : return displaykey.Web.JobComplete.Message.Rescinded(this.Job.JobNumber)
      case "Canceling"    : return displaykey.Web.JobComplete.Message.ScheduledCancellation(this.Job.JobNumber, DateFormat.getDateTimeInstance().format(this.CancellationDate))
      case "AuditComplete": return displaykey.Web.JobComplete.Message.AuditComplete((this.Job as Audit).AuditInformation.AuditScheduleType, this.Job.JobNumber)
      case "Waived"       : return displaykey.Web.JobComplete.Message.AuditWaived(this.Job.JobNumber)
      case "Draft"        : return displaykey.Web.JobComplete.Message.Draft(this.Job.DisplayType, this.Job.JobNumber)
      case "Quoted"       : return displaykey.Web.JobComplete.Message.Quoted(this.Job.DisplayType, this.Job.JobNumber)
      default             : return displaykey.Web.JobComplete.Message.UnknownStatus(this.Status)
    }
  }

  /**
   * Returns a title to display in the JobComplete.pcf page, based on the PolicyPeriod's Status
   * and the Job.
   */
  property get JobCompletionTitle() : String {
    switch(this.Status) {
      case "Reinstating" : return displaykey.Web.JobComplete.Title.Reinstating(this.Job.DisplayType)
      case "Canceling"   : return displaykey.Web.JobComplete.Title.Canceling(this.Job.DisplayType)
      default            : return displaykey.Web.JobComplete.Title(this.Job.DisplayType, this.Status)
    }
  }

  /**
   * Syncs policy lines against the product model, fixes all issues marked as ShouldFixDuringNormalSync,
   * and returns all the issues found regardless of whether or not they were fixed.
   */
  function syncPolicyLines() : List<ProductModelSyncIssueWrapper> {
    var originalIssues = this.checkPolicyLinesAgainstProductModel()
    var issueWrappers = ProductModelSyncIssueWrapper.wrapIssues(originalIssues)
    issueWrappers.fixDuringNormalSync(this)
    return issueWrappers
  }

  /**
   * Checks policy term against the product model and returns the resulting sync issues.
   */
  function checkPolicyTermAgainstProductModel() : List<ProductModelSyncIssueWrapper> {
    var originalIssues = new ArrayList<ProductModelSyncIssue>()
    var term = this.TermType
    if (term != null && !getAvailablePolicyTermsForCurrentOffering().contains(term)) {
      originalIssues.add(new UnavailablePolicyTermIssue(this, term))
    }

    return ProductModelSyncIssueWrapper.wrapIssues(originalIssues)
  }

  /**
   * Syncs policy terms against the product model, fixes all issues marked as ShouldFixDuringNormalSync,
   * and returns all the issues found regardless of whether or not they were fixed.
   */
  function syncPolicyTerm() : List<ProductModelSyncIssueWrapper> {
    var issueWrappers = checkPolicyTermAgainstProductModel()
    issueWrappers.fixDuringNormalSync(this)
    return issueWrappers
  }

  function getAvailablePolicyTermsForCurrentOffering() : List<TermType> {
    var offeringCode = this.EffectiveDatedFields.OfferingCode
    var availableTerms = this.Policy.Product.AllowedPolicyTerms.toList()
    var offering = OfferingLookup.getByCode(offeringCode)
    if (offering != null) {
      var disabledTerms = offering.getPolicyTermSelections().where(\p -> !p.isEnabled()).map(\p -> p.TermType)
      availableTerms = availableTerms.subtract(disabledTerms).toList()
    }
    return availableTerms.toList()
  }

  /**
   * The contacts on the account that are candidates to be a PolicyNamedInsured.
   * These are the AccountHolder, Drivers, SecondaryContacts, and NamedInsureds.
   * Additionally, the contacts must a person, company, or either, if the policy's
   * product account type is "person", "company", or "any", respectively.
   *
   * The contacts are guaranteed to be unique.
   * {@see AccountBaseEnhancement#findPolicyNamedInsuredCandidates(Product) : Set<AccountContact>)
   */
  property get PolicyNamedInsuredCandidates() : Set<AccountContact> {
    return this.Policy.Account.findPolicyNamedInsuredCandidates(this.Policy.Product)
  }

  property get SecondaryNamedInsuredCandidates() : AccountContact[] {
    return this.PolicyNamedInsuredCandidates.subtract({
      this.PrimaryNamedInsured.AccountContactRole.AccountContact,
      this.SecondaryNamedInsured.AccountContactRole.AccountContact
    }).toTypedArray()
  }

  /**
   * For each AccountContact returned by the UnassignedAdditionalNamedInsureds property,
   * add that AccountContact as an additional named insured to the PolicyPeriod
   */
  function addAllExistingAdditionalNamedInsureds() : PolicyAddlNamedInsured[] {
    var policyNamedInsureds = new ArrayList<PolicyAddlNamedInsured>()
    for(ani in UnassignedAdditionalNamedInsureds) {
      policyNamedInsureds.add(this.addNewPolicyAddlNamedInsuredForContact(ani.Contact))
    }
    return policyNamedInsureds.toTypedArray()
  }

  /**
   * All the additional named insureds that are not already assigned to this policy period.
   */
  property get UnassignedAdditionalNamedInsureds() : AccountContact[] {
    var plugin = Plugins.get(IContactConfigPlugin)
    var accountContactRoleType = plugin.getAccountContactRoleTypeFor("PolicyAddlNamedInsured")
    var assignedPolicyNamedInsureds = this.NamedInsureds.map(\ ni -> ni.AccountContactRole.AccountContact)
    return this.Policy.Account.getAccountContactsWithRole(accountContactRoleType)
                              .subtract(assignedPolicyNamedInsureds)
                              .toTypedArray()
  }

  /**
   * The contacts on the account that are candidates to be a AdditionalNamedInsured.
   * These are the AccountHolder, Drivers, SecondaryContacts, and NamedInsureds.
   * Additionally, the contacts must a person, company, or either, if the policy's
   * product account type is "person", "company", or "any", respectively.
   *
   * The contacts are guaranteed to be unique.
   */
  property get AdditionalNamedInsuredOtherCandidates() : AccountContact[] {
    var plugin = Plugins.get(IContactConfigPlugin)
    var accountContactRoleType = plugin.getAccountContactRoleTypeFor("PolicyAddlNamedInsured")
    var otherAccountContacts = this.Policy.Account.getAccountContactsWithAnyRole({"AccountHolder", "Driver", "SecondaryContact"})
    return otherAccountContacts.where(\ ac -> plugin.canBeRole(ac.ContactType, accountContactRoleType) and
                                                           not ac.hasRole(accountContactRoleType))
  }

  /**
   * Add a new contact as a PolicyAddlNamedInsured on this period.  This has the side-effect of creating
   * the Contact, AccountContact, and NamedInsured on the account.  These entities are all created
   * in this period's bundle.
   * @param contactType The type of contact to create
   * @return The newly created PolicyAddlNamedInsured
   */
  function addNewPolicyAddlNamedInsuredOfContactType(contactType : ContactType) : PolicyAddlNamedInsured {
    var acctContact = this.Policy.Account.addNewAccountContactOfType(contactType)
    return addNewPolicyAddlNamedInsuredForContact(acctContact.Contact)
  }

  /**
   * Add a new PolicyAddlNamedInsured to this period, linked to the NamedInsured role on the acctContact.
   * This method has a side-effect of creating the Account Contact and NamedInsured on the account if they don't
   * already exist.  These entities are all created in this period's bundle.
   * @param contact The Contact that the PolicyAddlNamedInsured ultimately refers to
   * @return The newly created PolicyAddlNamedInsured
   * @throws IllegalArgumentException If Contact is already a PolicyAddlNamedInsured on this period
   */
  function addNewPolicyAddlNamedInsuredForContact(contact : Contact) : PolicyAddlNamedInsured {
    return this.addNewPolicyContactRoleForContact(contact, "PolicyAddlNamedInsured") as PolicyAddlNamedInsured
  }

  /**
   * Removes the PolicyNamedInsured from the policy unless there is a LocationNamedInsured referencing it,
   * in which case it throws an exception.
   */
  function removePolicyNamedInsured(polNamedInsured : PolicyNamedInsured) {
    if (not polNamedInsured.LocationNamedInsureds.IsEmpty) {
      throw new DisplayableException(displaykey.Web.Policy.LocationNamedInsured.UnexpectedDeletion(polNamedInsured, polNamedInsured.LocationNamedInsureds.first().Location))
    }
    
    var errorMsgs = new ArrayList<String>()
    this.Lines.each(\ line -> {
         var errorMsg = line.canSafelyDeleteNamedInsured(polNamedInsured)
         if (errorMsg != null){
           errorMsgs.add(errorMsg)
         }
      })
    if (not (errorMsgs.Empty)){
      throw new DisplayableException(errorMsgs.toTypedArray())
    }
        
    this.removeFromPolicyContactRoles(polNamedInsured)
  }

  /**
   * Create and add a new contact as a PolicyBillingContact on this period.  This has the
   * side-effect of making it a BillingContact on the account.
   */
  function addNewPolicyBillingContactOfContactType(contactType : typekey.ContactType) : PolicyBillingContact {
    var acctContact = this.Policy.Account.addNewAccountContactOfType(contactType)
    return addNewPolicyBillingContactForContact(acctContact.Contact)
  }

  /**
   * Create and add <code>contact</code> as a PolicyBillingContact on this period.  This has the
   * side-effect of making it a BillingContact on the account if it isn't already.  An exception
   * is thrown if the contact is already a PolicyBillingContact on this period.
   */
  function addNewPolicyBillingContactForContact(contact : Contact) : PolicyBillingContact {
    return this.addNewPolicyContactRoleForContact(contact, "PolicyBillingContact") as PolicyBillingContact
  }

  /**
   * Set the <code>contact</code> as the billing contact on this period if it isn't already.
   * This has the side-effect of<ul>
   * <li>creating the acctContact for the given Contact on this Period's Account if there is not one already
   * <li>making the acctContact a BillingContact if it isn't already one
   * <li>making the acctContact a PolicyBillingContact if it isn't already one
   * <li>removing the PolicyBillingContact role from the previous billing contact
   * </ul>
   */
  function changeBillingContactTo(contact : Contact) {
    var pbcs = this.PolicyContactRoles.whereTypeIs(PolicyBillingContact).where(\ pcr -> pcr.AccountContactRole.AccountContact.Contact == contact)
    if (pbcs.Count > 1) {
      throw new IllegalStateException(displaykey.Java.Contact.Error.DuplicateRoles(pbcs.Count, PolicyBillingContact, contact))
    }
    var pbc = pbcs.first()
    if (pbc == null) {
      pbc = addNewPolicyBillingContactForContact(contact)
    }
    if (this.BillingContact != pbc) {
      var priorBilling = this.BillingContact
      if (priorBilling != null) {
        this.removeFromPolicyContactRoles(priorBilling)
      }
      this.EffectiveDatedFields.setFieldValue("BillingContact", pbc)
    }
  }

  /**
   * Remove the billing contact
   */
  function removeBillingContact() {
    var pbcs = this.PolicyContactRoles.whereTypeIs(PolicyBillingContact)
    pbcs.each(\ p -> this.removeFromPolicyContactRoles(p))
  }

  /**
   * Returns an array of Contacts for which the AccountContact type is BillingContact,
   *   excluding the current BillingContact.
   */
  property get BillingContactExistingCandidates() : AccountContact[] {
    var pbcs = this.PolicyContactRoles.whereTypeIs(PolicyBillingContact)
    return this.Policy.Account.getAccountContactsWithRole(typekey.AccountContactRole.TC_BILLINGCONTACT)
      .subtract(pbcs*.AccountContactRole*.AccountContact).toTypedArray()
  }

  /**
   * Returns an array of Contacts for which the AccountContact type is not BillingContact.
   */
  property get BillingContactOtherCandidates() : AccountContact[] {
    var pbcs = this.PolicyContactRoles.whereTypeIs(PolicyBillingContact)
    return this.Policy.Account.ActiveAccountContacts
      .subtract(BillingContactExistingCandidates)
      .subtract(pbcs*.AccountContactRole*.AccountContact.toList()).toTypedArray()
  }

  property get PolicyLocationsWM() : PolicyLocation[] {
    return this.PolicyLocations.map(\ p -> p.LastVersionWM)
  }

  function getPolicyLocationWM(state : State) : PolicyLocation[]{
    return PolicyLocationsWM.where(\ p -> p.State == state)
  }

  /**
   * @return the policy location matching the given location number
   */
  function getPolicyLocation(LocationNum : int) : PolicyLocation{
    return this.PolicyLocations.singleWhere(\ p -> p.LocationNum == LocationNum)
  }

  property get PolicyAddressCandidates() : Address[] {
    return this.PrimaryNamedInsured.AccountContactRole.AccountContact.Contact.AllAddresses
      .subtract({this.PolicyAddress.Address}) as Address[]
  }

  /**
   * Populates the internal reference date fields on coverages and modifiers with their current
   * reference date, if the field is not already populated. This method should only be called
   * when binding a policy period, to improve the performance of calculating reference dates in
   * subsequent jobs within the same policy term.
   */
  function denormalizeReferenceDates() {
    for (var slice in this.OOSSlices) {
      slice.EffectiveDatedFields.ProductModifiers.each(\ m -> m.denormalizeReferenceDate())
      slice.Lines.each(\ l -> l.denormalizeReferenceDates())
    }
  }

  /**
   * Sets the internal reference date fields on coverages and modifiers to null. This method
   * should only be called when creating a new policy term, to ensure that reference dates are
   * recalculated.
   */
  function clearDenormalizedReferenceDates() {
    for (var slice in this.OOSSlices) {
      slice.EffectiveDatedFields.ProductModifiers.each(\ m -> m.clearReferenceDateInternal())
      slice.Lines.each(\ l -> l.clearDenormalizedReferenceDates())
    }
  }

  function getPolicyPeriodDateDisplay() : String{
    return this.PeriodStart.format("short") + " - " + getCoverageEndDate().format("short")
  }


  function getCoverageEndDate() : Date {
    return this.CancellationDate != null ? this.CancellationDate : this.PeriodEnd
  }

  function isWithinValidPeriod(date : Date) : boolean {
      return this.PeriodStart.compareTo(date) <= 0 and getCoverageEndDate().compareTo(date) > 0
  }

  /**
   * This method returns a map of AccountContacts to a list of Roles that Account Contact plays
   * on the policy period.  This is useful for generating the full list of Policy Contact Roles
   * on a PolicyPeriod grouped by the AccountContact.
   */
  property get AccountContactRoleMap() : java.util.Map<AccountContact, java.util.List<PolicyContactRole>> {
    return this.PolicyContactRoles.partition(\ pcr -> pcr.AccountContactRole.AccountContact)
  }

  /**
   * This method returns the set (no duplicates) of all states associated with this PolicyPeriod.  This
   * is the union of CoveredStates (the set of states that have at least one Coverable) and LocationStates
   * (the set of states that have at least one location).
   * Performance note:  This method has a high cost as it traverses all Coverables in the PolicyPeriod.  It
   * is not recommended to use this method due to these performance concerns.
   */
  property get AllStates() : Jurisdiction[] {
    return this.Lines*.CoveredStates.union(LocationStateSet.toTypedArray()).toTypedArray()
  }

  /**
   * This method returns the set (no duplicates) of all states that have at least one PolicyLocation in
   * that state.  PolicyLocations with a <code>null</code> are not considered to be in any state and are
   * not included in the results.
   */
  property get LocationStates() : Jurisdiction[] {
    return LocationStateSet.toTypedArray()
  }

  private property get LocationStateSet() : Set<Jurisdiction> {
    var jurisdictions = new HashSet<Jurisdiction>()
    for(loc in this.PolicyLocations) {
      if(loc.State != null) {
        jurisdictions.add(JurisdictionMappingUtil.getJurisdiction(loc))
      }
    }
    return jurisdictions.toSet()
  }

  /**
   * Returns the OfficialIDs associated with all of the NamedInsureds in the given state
   */
  function getNamedInsuredOfficialIDsForState(st : State) : OfficialID[] {
    return this.NamedInsureds.flatMap(\ p -> p.getOfficialIDsForState(st))
  }

  // meaning of this is actually "has at least one MANUAL override"
  function hasAtLeastOneCostOverride() : boolean {
    return this.AllCosts.hasMatch(\ cost -> cost.HasOverride)
  }

  function reportingTrendSynopsis(shouldBePersisted : boolean) : ReportingTrendSynopsis {
    return shouldBePersisted
             ? new PersistedReportingTrendSynopsis(this)
             : new ComputedReportingTrendSynopsis(this)
  }

  function updateTrendAnalysisValues() {
    var synopsis = new ComputedReportingTrendSynopsis(this)
    this.PolicyTerm.TotalReportedPremium = synopsis.TotalReportedPremium
    this.PolicyTerm.TotalEstimatedPremium = synopsis.TotalEstimatedPremium
    this.PolicyTerm.DaysReported = synopsis.DaysReported
  }

  /**
   * @return a map from PolicyLinePattern to array of jurisdiction for each line on the PolicyPeriod.
   */
  property get AllPolicyLinePatternsAndJurisdictions() : Map<PolicyLinePattern, Jurisdiction[]> {
    var linesAndStates = new HashMap<PolicyLinePattern, Jurisdiction[]>()
    this.Lines.each(\ line -> {
      linesAndStates.put(line.Pattern, line.CoveredStates)
    })
    return linesAndStates
  }

  /**
   * This Property returns all EffDated beans implementing the {@link UniqueOnPolicyPeriod} interface
   * to be evaluated for duplicates during validation.
   */
  property get UniqueOnPolicyPeriodBeansForValidation() : UniqueOnPolicyPeriod[] {
    var uniqueBeans : List<UniqueOnPolicyPeriod> = this.PolicyContactRoles.toList()
    uniqueBeans.addAll(this.PolicyLocations.toList())
    if (this.BusinessAutoLineExists) {
      uniqueBeans.addAll(this.BusinessAutoLine.Jurisdictions.toList())
    }
    return uniqueBeans.toTypedArray()
  }

  /**
   * Returns all UWIssue's associated with this PolicyPeriod that have not been soft-deleted.
   */
  property get UWIssuesActiveOnly() : UWIssue[] {
    return this.UWIssuesIncludingSoftDeleted.where(\ issue -> issue.Active)
  }

  /**
   * Expires approvals with a duration type of "next change" in all slices of this period from the
   * edit effective date forward. Normally called when starting a job.
   */
  function expireNextChangeApprovals() {
    expireApprovals(\issue -> issue.Approval.DurationType == TC_NEXTCHANGE)
  }

  /**
   * Expires approvals with a duration type of "end of term" in all slices of this period from the
   * edit effective date forward. Normally called when starting a renewal or rewrite.
   */
  function expireEndOfTermApprovals() {
    expireApprovals(\issue -> issue.Approval.DurationType == TC_ENDOFTERM)
  }

  /**
   * Expires approvals whose expiration date is strictly earlier than this period's edit effective
   * date in all slices of this period from the edit effective date forward. Normally called when
   * starting a job or changing the period window dates.
   */
  function expirePastDateApprovals() {
    expireApprovals(\issue -> issue.Approval.ApprovalInvalidFrom <= this.EditEffectiveDate)
  }

  private function expireApprovals(condition(issue : UWIssue) : boolean) {
    for (slice in this.OOSSlices) {
      slice.UWIssuesIncludingSoftDeleted.where(condition).each(\issue -> issue.expireApproval())
    }
  }

  /**
   * Check for, and resolve, duplicates in the policy period.  Duplicates can typically
   * only be created with OOSE changes.
   */
  function checkForDuplicatesInSlices(oosSlices_ : entity.PolicyPeriod[]) {
    checkForSingletonPolicyContactRolesInSlices(
    {
      PolicyBillingContact -> \ p -> p.BillingContact,
      PolicyPriNamedInsured -> \ p -> p.PrimaryNamedInsured,
      PolicySecNamedInsured -> \ p -> p.SecondaryNamedInsured
    },
    oosSlices_)
  }

  /**
   * Ensure that a singleton specified by the getSingletonMethodsMap is the only
   * PolicyContactRole of that particular type within that PolicyPeriod OOS slice.
   * Any extra PCRs of the singleton type are removed.
   *
   * An extra singleton can be created with an OOS change, e.g., a policy change
   * sets a BillingContact at T2, is bound, then an OOS policy change sets the
   * BillingContact at T1.  While the edgeFK used to specify the singleton is
   * correct, there are now two BillingContact roles in the T2 slice.
   */
  function checkForSingletonPolicyContactRolesInSlices(getSingletonMethodsMap : Map<Type<PolicyContactRole>, block(period : PolicyPeriod) : PolicyContactRole>, oosSlices_ : entity.PolicyPeriod[]) {
    for (slice in oosSlices_) {
      var pcrsByType = slice.PolicyContactRoles.partition(\ pcr -> typeof(pcr)).toAutoMap(\ i -> Collections.emptyList<PolicyContactRole>())
      for (singletonType in getSingletonMethodsMap.Keys) {
        var getSingletonMethod = getSingletonMethodsMap.get(singletonType)
        var actualSingleton = getSingletonMethod(slice)
        for (pcr in pcrsByType.get(singletonType)) {
          if (pcr != actualSingleton) {
            pcr.remove()
          }
        }
      }
    }
  }

  function mustInvalidateQuoteBeforeReleasingUWEditLock(authorityProfiles : UWAuthorityProfile[]) : boolean {
    return this.ValidQuote and not this.UWIssuesActiveOnly.issuesBlockingUser("BlocksQuoteRelease", authorityProfiles).IsEmpty
  }

  /**
   *  Nulls answers corresponding to questions that are hidden in the UI at the time of Quote.
   */
  function removeUnusedAnswers() {
    for(answer in this.Answers) {
      if (answer.Question != null and answer.hasAnswer() and not answer.Question.isQuestionVisible(this)) {
        answer.AnswerValue = null
      }
    }
  }

  function removeUnusedBuildings() {
    for (var location in this.PolicyLocations) {
      for (var building in location.Buildings) {
        if (canRemoveBuilding(building)) {
          location.removeBuilding(building)
        }
      }
    }
  }

  function canRemoveBuilding(building : Building) : boolean {
    return this.Lines.firstWhere(\ line -> StringUtils.isNotBlank(line.canSafelyDeleteBuilding(building))) == null
  }

  /**
   * Returns the date of the next slice in time where there are any blocking UWIssues.  If there
   * are no blocking issues, or no future slices after the current SliceDate of this PolicyPeriod,
   * this property will return null.
   */
  property get NextBlockedSliceDate() : Date {
    var nextBlockingSlice = this.OOSSlices.where(\s -> s.SliceDate > this.SliceDate).firstWhere(\s -> s.HasAnyBlockingIssues)
    return nextBlockingSlice == null ? null : nextBlockingSlice.SliceDate
  }

  protected property get HasAnyBlockingIssues() : boolean {
    return this.UWIssuesActiveOnly.hasMatch(\i -> i.CurrentBlockingPoint != "NonBlocking")
  }

  /**
   * Returns the sum of the risk points for any prequal questions that have incorrect answers.
   */
  property get PreQualRiskPointSum() : int {
    return this.Policy.Product.getAvailableQuestionSetsByType(QuestionSetType.TC_PREQUAL,this)
               .flatMap(\qs -> qs.Questions)
               .sum(\q -> q.computeEffectiveRiskPoints(this))
  }

  /**
   * Removes Period Answers to question sets of the given type from this period.
   */
  function removePeriodAnswersToQuestionSetsOfType(questionSetType : typekey.QuestionSetType) {
    var answersToDelete = this.PeriodAnswers.where(\ answer -> answer.Question.QuestionSet.QuestionSetType == questionSetType )
    answersToDelete.each(\ answer -> this.removeFromPeriodAnswers(answer))
  }

  /**
   * Merges duplicate PolicyContactRoles on the period.  The earliest created PolicyContactRole (determined by the ID)
   * is used as the survivor.
   */
  function mergeDuplicatePolicyContactRoles() {
    // Get all the PCRs on the policy, and partition them into a map by their EffDatedUniqueKey
    // any key that then maps to more than 1 bean within the slice has duplicates, and can be merged.
    var overlappingMap = this.PolicyContactRoles.partition(\ pcr -> pcr.genUniqueKey())
    for (duplicateValues in overlappingMap.Values.where(\ vals -> vals.Count > 1)) {
      var survivor = duplicateValues.minBy(\ pcr -> pcr.ID)
      duplicateValues.remove(survivor)
      duplicateValues.each(\ merged -> survivor.merge(merged))
    }
  }

  /**
   * Get a list of diff items based on the diff reason
   */
  function getDiffItemsForDiffReason(reason : DiffReason, currentPeriod : PolicyPeriod) : java.util.List<gw.api.diff.DiffItem> {
    if (reason =="MultiVersionJob" or reason == "CompareJobs") {
      return this.compareTo(reason, currentPeriod)
    } else if (reason == "PolicyReview" or reason == "Integration" or reason == "ApplyChanges") {
      return currentPeriod.getDiffItems(reason)
    }
    return new ArrayList<DiffItem>()
  }

  /**
   * Get the policyLocation which policyLocation.Accountlocation matches the one passed into the function
   */
  function getPolicyLocation(accountLocation : AccountLocation) : PolicyLocation {
    var policyLocations = this.PolicyLocations.where(\ pl-> pl.AccountLocation == accountLocation)
    if (policyLocations.Count == 0) {
      return null;
    } else if (policyLocations.Count == 1) {
      return policyLocations[0];
    } else {
      throw "Expected at most one PolicyLocation for the given AccountLocation ${accountLocation}, " +
          "got ${policyLocations.Count}"
    }
  }

  /**
   * get the displayname for the account location, it returns the policyLocation displayname if it finds a matches(where
   * policyLocation.AccountLocation equals to the accountLocation passed into the funciton), otherwise it returns the account location
   * displayname.
   */
  function getPolicyLocationOptionDisplayName(accountLocation : AccountLocation) : String {
    var policyLocation = getPolicyLocation(accountLocation)
    return policyLocation <> null ? policyLocation.DisplayName : accountLocation.DisplayName
  }

  /**
   * Sets effective date of the period and adjust expiration date according to the term type.
   * @param effectiveDate  new effective date to be set on the period
   */
  function setPeriodDates(effectiveDate : Date) {
    if (this.Submission != null) {
      this.SubmissionProcess.beforePeriodStartChanged(effectiveDate)
    }
    if (this.TermType == "Other") {
      this.PeriodStart = effectiveDate
    } else {
      var policyPeriodPlugin = gw.plugin.Plugins.get(gw.plugin.policyperiod.IPolicyTermPlugin)
      var expirationDate = gw.api.util.DateUtil.mergeDateAndTime(
        policyPeriodPlugin.calculatePeriodEnd(effectiveDate, this.TermType, this),
        this.PeriodEnd)
      this.setPeriodWindow(effectiveDate, expirationDate)
    }
  }

  function printDocument(templateType : String) {
    printDocument(templateType, templateType)
  }

  function printDocument(templateType : String, fileName : String) {
    var templatePlugin = gw.plugin.Plugins.get(gw.plugin.document.IDocumentTemplateSource)
    var template = templatePlugin.getDocumentTemplate(
          gw.api.web.document.DocumentsHelper.getTemplateID(this, templateType),
          LocaleUtil.toLanguage(this.Policy.PrimaryLanguage))
    if (template == null) {
      throw new DisplayableException(displaykey.DocumentProduction.Error.TemplateNotFound(templateType))
    }
    var docInfo = DocumentProduction.createDocumentSynchronously(
          template,
          DocumentsHelper.getPrintQuoteParameters(),
          new Document())
    DocumentsHelper.renderDocumentContentsDirectly(fileName, docInfo)
  }

  property get ValidationLevel() : ValidationLevel {
    return this.Job == null ? typekey.ValidationLevel.TC_QUOTABLE : this.Job.getValidationLevel(this)
  }

  /**
   * @return the rating style of this policy period
   */
  property get RatingStyle() : RatingStyle {
    return this.Job == null ? typekey.RatingStyle.TC_DEFAULT : this.Job.getRatingStyle(this)
  }

  function onBeginIssueJob() {
    for(line in this.Lines){
      line.onBeginIssueJob()
    }
  }

  /**
   * Determines whether this {@link PolicyPeriod}'s {@link Policy} has been rewritten
   * and that its {@link PolicyTerm} is canceled and later than the rewritten term (and
   * as such needs to stay canceled).
   */
  function isRewrittenToNewAccountAndCanceledLocked() : boolean {
    var newPolicy = this.Policy.RewrittenToNewAccountDestination
    // Needs to be canceled and in force and rewritten
    if (this.CancellationDate == null or not this.MostRecentModel or newPolicy == null) {
      return false
    }
    var periodStart = newPolicy.findEarliestPeriodStart()
    // Needs to be rewritten and later than rewritten term
    return this.CancellationDate < periodStart ? false : true
  }

  /**
   * Create Reinsurables based on reinsurable coverables which are associated with
   * RIRisks or a third party implementation of reinsurable risks
   */
  function createReinsurables() {
    if (this.PolicyTerm.GenerateReinsurables) {
      var riskDatas = createRiskDatas(this)
      createReinsurablesFromRiskDatas(this, riskDatas)

      if(this.Job.OOSJob) {
        for(slice in this.OOSSlices) {
          riskDatas = createRiskDatas(slice)
          createReinsurablesFromRiskDatas(slice, riskDatas)
        }
      }
    }
    // re-denormalize AccountLocation, in case it existed and was changed
    for (lr in this.LocationRisks) {
      lr.AccountLocation = lr.Location.AccountLocation
    }
  }

  private function createReinsurablesFromRiskDatas(branch : PolicyPeriod, riskDatas : List<RiskData>){
    var reinsurablesToRemove = branch.AllReinsurables
    for (riskData in riskDatas) {
      var riskEntity = riskData.getOrCreateReinsurable(branch)
      reinsurablesToRemove.remove(riskEntity)
    }

    for (riskEntity in reinsurablesToRemove) {
      // This risk could be created in the previous quote of this branch, in the based on branch
      // or in the other quote version that this quote is created from.
      if (riskEntity.EffectiveDate.equals(branch.EditEffectiveDate)) {
        riskEntity.removeFromTerm()  // removes the risk entirely
      } else {
        // we also need to end date the risk outside the graph...
        riskEntity.remove()  // end date the risk instead of removing the whole thing
      }
    }

    //TODO-gclarke: see if we can limit the scope of this to just ReinsurableRisks, or move their generation before the other mergeDuplicateAdds call
    if (branch.Job.OOSJob) {
      branch.mergeDuplicateAdds()
    }
  }

  private function createRiskDatas(branch : PolicyPeriod) : List<RiskData>{
    var riskDatas = new ArrayList<RiskData>()
    // first group by RICoverageGroup
    var allCoverages = branch.Lines*.AllCoverages.partition(\ c -> c.RICoverageGroupType)
    for (entry1 in allCoverages.entrySet()) {
      var covGroup = entry1.Key
      if(covGroup <> null){
        // then group by reinsurable coverable
        var coverages = entry1.Value.partition(\ c -> c.ReinsurableCoverable)
        for (entry2 in coverages.entrySet()){
          var owner = entry2.Key
          if (owner <> null) {
            // calcualte the TIV for the list of coverages associated with the ReinsurableCoverable owner.
            // normally there will be only one line, but package polices are the exception,
            // AND it is theoretically possible that a ReinsurableCoverable will have Coverages
            // that apply to more than one line.   These should sum to a single TIV.

            // Try all of the lines, and let them handle whatever they can, ignoring the rest; if they don't
            // recognize a coverage the value should be BigDecimal.ZERO for that coverage.   The value null
            // is returned ONLY to signal an "unlimited" TIV value...in which case the sum TIV should become null.
            var reinsuranceCurrency = Plugins.get(IReinsuranceConfigPlugin).getReinsuranceCurrency(entry2.Value)
            var tiv = MonetaryAmounts.zeroOf(reinsuranceCurrency)
            for (line in branch.Lines) {
              if (tiv == null) {
                break
              } else {
                var branchTiv = line.calculateTotalInsuredValue(entry2.Value, reinsuranceCurrency)
                if (branchTiv == null) {
                  tiv = null
                } else {
                  tiv += branchTiv
                }
              }
            }
            var riskData = new RiskData(owner, covGroup, tiv, reinsuranceCurrency)
            riskDatas.add(riskData)
          }
        }
      }
    }
    return riskDatas
  }

  /**
   * Checks whether this policy period can view modifiers. Returns true if it's in the correct state
   * and the user has the appropriate permissions.
   */
  property get CanViewModifiers() : boolean {
    return this.Job.canViewModifiers(this)
  }
  
  property get PolicyStartDate() : Date {
    //we do not use database query here because the index is happening precommit
    // TODO: there is a field on Policy which contains this...has it been updated when we need it?
    return this.Policy.findEarliestPeriodStart()
  }

  /**
   * Checks whether this policy period has any lines with WorkersComp flag set to true
   * Note: This is different to WorkersCompLineExists property, which explicity checks for Workers Comp Line
   */
  property get HasWorkersComp() : boolean {
    return this.Lines.hasMatch(\ l -> l.WorkersComp)
  }

  property get PolicyEndDate() : Date {
   return this.Policy.LatestBoundPeriod.Job typeis Cancellation ?  
    this.Policy.LatestBoundPeriod.CancellationDate:
    this.Policy.Periods.orderByDescending(\ p -> p.PeriodEnd).firstWhere(\ p -> p.Status == TC_BOUND).PeriodEnd 
  }
  
  /**
   * Checks whether this policy period has any lines which support non-specific locations.
   */
  property get SupportsNonSpecificLocations() : boolean {
    return this.Lines.hasMatch(\ l -> l.SupportsNonSpecificLocations)
  }
}

