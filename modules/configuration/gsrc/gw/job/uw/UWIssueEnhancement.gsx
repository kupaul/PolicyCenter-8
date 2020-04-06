package gw.job.uw

uses java.util.Date
uses java.lang.IllegalStateException
uses java.util.ArrayList
uses java.lang.IllegalArgumentException

enhancement UWIssueEnhancement : UWIssue {

  property get HumanTouched() : boolean {
    var htIssues = this.PolicyPeriod.PolicyTerm.HumanTouchedIssues
    return htIssues.hasMatch(\ issue -> issue.IssueKey == this.IssueKey
                                    and issue.IssueType == this.IssueType)
  }

  property set HumanTouched(value : boolean) {
    if (not value) {
      throw new IllegalArgumentException("Cannot disable HumanTouched")
    }
    if (not HumanTouched) {
      var humanTouchedID = new UWIssueUniqueID(this){
        :IssueKey = this.IssueKey,
        :IssueType = this.IssueType
      }
      this.PolicyPeriod.PolicyTerm.addToHumanTouchedIssues(humanTouchedID)
    }
  }

  property get Approval() : UWIssueApproval {
    return this.HasApprovalOrRejection
        ? new UWIssueApproval(this)
        : null
  }

  property set Approval(arg : UWIssueApproval) {
    if (arg == null) {
      // clear out the associated approval information
      removeApprovalOrRejection(this)
    } else {
      if (arg.Issue != this) {
        throw new IllegalStateException("Attempt to assign a UWIssueApproval to a non-owning UWIssue")
      }
      this.HasApprovalOrRejection = true
    }
  }

  property get CurrentBlockingPoint() : UWIssueBlockingPoint {
    if (this.Rejected) {
      return "Rejected"
    }
    else if (this.Approval.ConditionMet) {
      return this.Approval.BlockingPoint
    }
    else {
      return this.IssueType.BlockingPoint
    }
  }

  property get Rejected() : boolean {
    return this.Active and this.Approval.BlockingPoint == UWIssueBlockingPoint.TC_REJECTED
  }

  property get CheckingSet() : UWIssueCheckingSet {
    return this.IssueType.CheckingSet
  }

  property get Histories() : UWIssueHistory[] {
    var allHistories = this.PolicyPeriod.Policy.IssueHistories
    return allHistories.where( \ history ->
            history.IssueKey == this.IssueKey and
            history.IssueType == this.IssueType)
  }

  function approvalConditionMetBy(referenceValue : String) : boolean {
    var comparator = this.IssueType.ComparatorWrapper
    return comparator.compare(this.Value, referenceValue)
  }

  /**
   * This method provides the non-Currency value of the UWIssue's Value
   */
  property get NonCurrencyReferenceValue() : String {
    var comparator = this.IssueType.ComparatorWrapper
    return comparator.getNonCurrencyDisplayString(this.Value)
  }

  /**
   * This method sets the non-Currency value of the UWIssue's Value
   */
  property set NonCurrencyReferenceValue(value : String) {
    var comparator = this.IssueType.ComparatorWrapper
    this.ApprovalValue = comparator.getValueString(value, this.Value)
  }

  property get ApprovalValueCurrency() : Currency {
    var comparator = this.IssueType.ComparatorWrapper
    return comparator.getValueCurrency(this.Value)
  }

  /**
   * Adds a "created" history line for this issue.
   *
   * <p>This method should be called exactly once when a new issue is created or re-created,
   * but should only be called after the issue is populated.
   */
  function addCreateHistory(automaticApprovalCause : String) : UWIssue {
    addHistory("Created", this.EffectiveDate, automaticApprovalCause)
    return this
  }

  /**
   * Adds a "system update" history line for this issue.
   *
   * This method should be called whenever some system process artificially alters an UWIssue.
   * e.g. Change Edit Effective Date
   *
   * @param cause the cause for the system update.
   * @returns the owning issue
   */
  function addChangeEffectiveDateHistory() : UWIssue {
    var history = addHistory("ChangeEffDate", this.EffectiveDate, displaykey.UWIssue.ChangeEffDate)

    history.ApprovalDurationType = this.ApprovalDurationType
    history.ApprovalInvalidFrom = this.ApprovalInvalidFrom

    //We want to record the approval value, not the issue value.
    history.ReferenceValue = this.ApprovalValue

    return this
  }

  /**
   * Removes the issue if it's open or no longer applicable; otherwise marks it as inactive.
   */
  function deactivate(automaticApprovalCause : String) : UWIssue {
    addHistory("Removed", this.SliceDate, automaticApprovalCause)
    if (this.HasApprovalOrRejection or this.HumanTouched) {
      this.Active = false
    }
    else {
      this.remove()  //hard delete
    }
    return this
  }

  function isBlocking(bp : UWIssueBlockingPoint) : boolean {
    return this.Active
      and  bp.Priority <= CurrentBlockingPoint.Priority
  }

  function isBlockingUser(bp : UWIssueBlockingPoint, authorityProfiles : UWAuthorityProfile[]) : boolean {
    return isBlocking(bp) and
           !(this.canBeApprovedBy(authorityProfiles) and this.IssueType.AutoApprovable)
  }

  function reject() : UWIssue {
    var rejection = createDefaultApproval()
    rejection.EditBeforeBind = true   // rejections are never removed when editing a period
    rejection.Duration = "Rescinded"  // rejections can never expire
    rejection.BlockingPoint = "Rejected"

    var history = addHistory("Rejected", this.EffectiveDate, this.AutomaticApprovalCause)
    history.EditBeforeBind = rejection.EditBeforeBind

    return this
  }

  function reopen() : UWIssue {
    reopenWithAutomaticCause(null)
    return this
  }

  function reopenWithAutomaticCause(cause : String) {
    if (this.Approval == null) {
      throw new IllegalStateException("Cannot reopen issue of type ${this.IssueType.Code} with key ${this.IssueKey}")
    }

//    this.ApprovalDurationType = null
//    this.ApprovalInvalidFrom = null
//    this.HasApprovalOrRejection = false
    var effDate = this.Approval.SliceDate
    removeFutureApprovalsOrRejections(false)
    addHistory("Reopened", effDate, cause)
  }

  private function addHistory(status : UWIssueHistoryStatus, effDate : Date, automaticOperationCause : String) : UWIssueHistory {
    if (effDate == null) {
      throw new IllegalArgumentException("effDate cannot be null, but we need this special check to get a gosu stack trace")
    }
    var history = new UWIssueHistory(this){
        :Status = status,
        :IssueType = this.IssueType,
        :IssueKey = this.IssueKey,
        :ReferenceValue = this.Value,
        :EffDate = effDate,
        :ResponsibleUser = User.util.CurrentUser,
        :AutomaticOperationCause = automaticOperationCause,
        :PolicyPeriod = this.PolicyPeriod
    }
    if (status == "Created") {
      history.BlockingPoint = this.CurrentBlockingPoint
    }
    this.PolicyPeriod.Policy.addToIssueHistories(history)
    return history
  }

  /**
   * Should be called exactly once when the approval has the values it will have
   * once committed.
   */
  function createApprovalHistoryFromCurrentValues() : UWIssue {
    var history = addHistory("Approved", this.EffectiveDate, this.AutomaticApprovalCause)

    history.ReferenceValue = this.ApprovalValue
    history.BlockingPoint = this.ApprovalBlockingPoint
    history.ApprovalDurationType = this.ApprovalDurationType
    history.ApprovalInvalidFrom = this.ApprovalInvalidFrom
    history.AutomaticOperationCause = this.AutomaticApprovalCause
    history.EditBeforeBind = this.CanEditApprovalBeforeBind
    return this
  }

  function createAutomaticApproval(automaticApprovalCause : String) : UWIssueApproval {
    return createBasicApproval(automaticApprovalCause)
  }

  function createDefaultApproval() : UWIssueApproval {
    this.HumanTouched = true
    //if already has an approval
    if (this.HasApprovalOrRejection and CurrentBlockingPoint != UWIssueBlockingPoint.TC_REJECTED) {
      return createApprovalFromCurrentApproval()
    }
    return createBasicApproval(null)
  }

  function createAutoApproval() : UWIssueApproval {
    //if already has an approval
    if (this.HasApprovalOrRejection and CurrentBlockingPoint != UWIssueBlockingPoint.TC_REJECTED) {
      return createApprovalFromCurrentApproval()
    }
    return createBasicApproval(null)
  }
  
  /**
   * Returns true if the issue's value or existence varies across slices of the current job.  This will return false
   * if the issue exists in the same state (active or inactive) and with the same value at all points in time after
   * the EditEffectiveDate of the current branch, and true if there's any variance in the either the value or the
   * active/inactive state.
   */
  property get ValueVariesAcrossSlices() : boolean {
    if (this.Branch.Job.OOSJob) {
      var relevantVersions = this.VersionList.AllVersions.where(\i -> i.ExpirationDate > this.Branch.EditEffectiveDate)
      return doValuesVary(relevantVersions) or not doIssuesConsistentlySpanPeriod(relevantVersions)
    }
    else {
      return false
    }
  }

  // Returns whether or not the values of the issues vary between the relevant issues
  private function doValuesVary(issueVersions : List<UWIssue>) : boolean {
    var allValues = issueVersions.map(\i -> i.Value).toSet()
    return allValues.size() > 1
  }

  // Returns true if the issue is either active or inactive/removed for the entire period, false if
  // it's active for some part of the period and inactive/removed for other parts
  private function doIssuesConsistentlySpanPeriod(issueVersions : List<UWIssue>) : boolean {
    // The easiest way to compute this seemed to be to compute the number of days covered by active issues,
    // rather than by trying to track date ranges
    var numberOfActiveDays = issueVersions.sum(\i ->
        (i.Active
           ? i.ExpirationDate.daysBetween(i.EffectiveDate < this.Branch.EditEffectiveDate
                                            ? this.Branch.EditEffectiveDate
                                            : i.EffectiveDate)
           : 0) )
    return numberOfActiveDays == 0 or numberOfActiveDays == this.Branch.EditEffectiveDate.daysBetween(this.Branch.PeriodEnd)
  }

  /**
   * Returns true if this issue blocks at any slice date from the EditEffectiveDate of the job forward.
   */
  property get IssueBlocksAtSomeSlice() : boolean {
    if (this.Branch.Job.OOSJob) {
      var thisVL = this.VersionList
      return this.PolicyPeriod.OOSSliceDates.hasMatch(\d -> {
        var issue = thisVL.AsOf(d)
        return issue != null and issue.getSlice(d).CurrentBlockingPoint != "NonBlocking"
      })
    }
    else {
      return this.CurrentBlockingPoint != "NonBlocking"
    }
  }

  // Returns a list of UWIssues as of each OOSE date, sliced on that date, provided that the issue exists at that point
  private property get RelevantOOSEVersions() : List<UWIssue> {
    var thisVL = this.VersionList
    var returnList = new ArrayList<UWIssue>()
    for (sliceDate in this.PolicyPeriod.OOSSliceDates) {
      var result = thisVL.AsOf(sliceDate)
      if (result != null) {
        returnList.add(result.getSlice(sliceDate))
      }
    }
    return returnList
  }

  private function createBasicApproval(automaticApprovalCause : String) : UWIssueApproval {
    removeFutureApprovalsOrRejections(false)
    var newApproval = new UWIssueApproval(this){:AutomaticApprovalCause = automaticApprovalCause}
    newApproval.initializeDefaultValues()
    return newApproval
  }

  private function createApprovalFromCurrentApproval() : UWIssueApproval {
    var validBlockingPoints = ValidApprovalBlockingPoints

    removeFutureApprovalsOrRejections(true)

    var newApproval = this.Approval
    if (not validBlockingPoints.contains(newApproval.BlockingPoint)) {
      newApproval.BlockingPoint = validBlockingPoints.earliest()
    }
    return newApproval
  }

  property get ValidApprovalBlockingPoints() : List<UWIssueBlockingPoint> {
    var result = UWIssueBlockingPoint.All
        .after(this.CurrentBlockingPoint)            //it must approve the issue to a later point
        .after(this.Branch.UnderWriterIssueBlockingPoint)    //it must approve the issue beyond where the job is now
    return result
  }

  private function removeApprovalOrRejection(slice : UWIssue) {
    // UW Approval "Valid Until Date" should be removed when an issue is re-opened.
    slice.ApprovalInvalidFrom = null
    slice.ApprovalDurationType = null

    slice.HasApprovalOrRejection = false
    slice.ApprovalBlockingPoint = null

    // The last created history retains the approval invalid from of the parent issue
    // because it is copied from the parent uwissue slice (above) but BEFORE the above clearing takes place
    var lastHistory = slice.Histories
          .where(\h -> h.PolicyPeriod == slice.PolicyPeriod)
          .orderByDescending(\ h -> h.CreateTimeOrNow).first()

    if (lastHistory != null) {
        lastHistory.ApprovalInvalidFrom = null
        lastHistory.ApprovalDurationType = null
    }
  }

  private function removeFutureApprovalsOrRejections(onlyRemoveStrictlyAfter : boolean) {
    for (slice in this.VersionList.AllVersions) {
      if (onlyRemoveStrictlyAfter and slice.EffectiveDate == this.SliceDate) {
        // do nothing
      } else if (slice.EffectiveDate >= this.SliceDate) {
        removeApprovalOrRejection(slice)
      } else if (slice.ExpirationDate > this.SliceDate) {
        removeApprovalOrRejection(slice.getSlice(this.SliceDate))
      }
    }
  }

  /**
   * Removes the approval on this issue and adds an "expired approval" entry to the issue history.
   */
  function expireApproval() {
    if (this.Approval == null) {
      throw new IllegalStateException(displaykey.UWIssue.Approval.CannotExpire(this.IssueType.Code, this.IssueKey))
    }
    var effDate = this.Approval.SliceDate
    var automaticApprovalCause = displaykey.UWIssue.Approval.Expired(this.PolicyPeriod.Job.Subtype, this.PolicyPeriod.Job.JobNumber)
    addHistory("Expired", effDate,  automaticApprovalCause)
    this.Approval.removeFutureApprovalsOrRejections()
  }

  function canAuthorizeDefaultApprovalValue(grants : UWAuthorityGrant[]) : boolean {
    return grants.hasMatch(\ g -> g.IssueType == this.IssueType and g.authorizes(defaultApprovalValue(this)))
  }

  private static function defaultApprovalValue(issue : UWIssue) : String {
    return issue.IssueType.calculateDefaultValue(issue.Value)
  }
}
