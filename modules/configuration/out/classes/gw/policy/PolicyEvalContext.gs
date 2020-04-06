package gw.policy

uses entity.windowed.UWIssueVersionList
uses gw.job.uw.types.ExclusiveSet
uses gw.pl.currency.MonetaryAmount

uses java.lang.IllegalArgumentException
uses java.lang.RuntimeException
uses java.math.BigDecimal
uses java.util.HashMap
uses java.util.Map
uses java.util.Set

@Export
class PolicyEvalContext {

  public static class Error extends RuntimeException {
    construct (msg : String) {
      super(msg)
    }
  }

  var _period : PolicyPeriod as readonly Period
  var _checkingSet : UWIssueCheckingSet as readonly CheckingSet
  var _preExistingIssues : Map<UWIssueType, Map<String, UWIssueVersionList>>
  var _untouchedIssues : Set<UWIssueVersionList>
  var _cause : String as AutomaticOperationCause  //not read-only for testing

  construct(periodArg : PolicyPeriod, checkingSetArg : UWIssueCheckingSet) {
    _period = periodArg
    _checkingSet = checkingSetArg
    var currentIssuesForCheckingSet = _period.VersionList.UWIssuesIncludingSoftDeleted.where(\ i -> CheckingSet == i.AllVersions.first().CheckingSet)
    _preExistingIssues = currentIssuesForCheckingSet
                                         .partition( \ i -> i.AllVersions.first().IssueType )
                                         .mapValues( \ issues -> issues.partitionUniquely( \ i -> i.AllVersions.first().IssueKey ))
                                         .toAutoMap( \ u -> new HashMap<String, UWIssueVersionList>() )
    _untouchedIssues = currentIssuesForCheckingSet.toSet()
    AutomaticOperationCause = "Policy issue evaluation (${CheckingSet.Code})"
  }

  /**
   * Either finds an existing UW issue with the specified type and key,
   *   or if no such issue exists, creates a new one.
   *
   * A pre-existing issue returned from here will be marked as "touched" and
   * will not be removed by {@link #removeOrphanedIssues}.
   */
  function addIssue(issueType : String, key : String,
      shortDescription : block() : String, longDescription : block() : String)
        : UWIssue {
    return addIssueInternal(issueType, key, shortDescription, longDescription, null)
  }

  /**
   * Either finds an existing UW issue with the specified type and key,
   *   or if no such issue exists, creates a new one, and then sets the
   *   specified state.
   *
   * A pre-existing issue returned from here will be marked as "touched" and
   * will not be removed by {@link #removeOrphanedIssues}.
   */
  function addIssue(issueTypeCode : String, key : String,
      shortDescription : block() : String, longDescription : block() : String,
        value : State) : UWIssue {
    var stateSet = new ExclusiveSet<State>(false, {value})
    return addIssueInternal(issueTypeCode, key, shortDescription, longDescription, stateSet)
  }

   /**
   * Either finds an existing UW issue with the specified type and key,
   *   or if no such issue exists, creates a new one, and then sets the
   *   specified decimal value.
   *
   * A pre-existing issue returned from here will be marked as "touched" and
   * will not be removed by {@link #removeOrphanedIssues}.
   */
  function addIssue(issueType : String, key : String,
      shortDescription : block() : String, longDescription : block() : String,
      value : BigDecimal) : UWIssue {
    return addIssueInternal(issueType, key, shortDescription, longDescription, value)
  }

   /**
   * Either finds an existing UW issue with the specified type and key,
   *   or if no such issue exists, creates a new one, and then sets the
   *   specified monetary value.
   *
   * A pre-existing issue returned from here will be marked as "touched" and
   * will not be removed by {@link #removeOrphanedIssues}.
   */
  function addIssue(issueType : String, key : String,
      shortDescription : block() : String, longDescription : block() : String,
      value : MonetaryAmount) : UWIssue {
    return addIssueInternal(issueType, key, shortDescription, longDescription, value)
  }

  /**
   * Either finds an existing UW issue with the specified type and key,
   *   or if no such issue exists, creates a new one.
   *
   * A pre-existing issue returned from here will be marked as "touched" and
   * will not be removed by the removeOrphanedIssues call.
   */
  private function addIssueInternal(issueTypeCode : String, key : String,
      shortDescription : block() : String, longDescription : block() : String,
      valueAsObject : Object) : UWIssue {
    var issue = findOrCreateIssue(issueTypeCode, key)
    if (issue.CheckingSet != CheckingSet) {
      var msg = "Issue of type \"${issueTypeCode}\" can only be created at ${issue.CheckingSet}, not ${CheckingSet}."
      msg += "\nException occurred generating issue [${key}] ${shortDescription} (${longDescription})"
      throw new PolicyEvalContext.Error(msg)
    }

    if ( ( shortDescription != null ) || ( longDescription != null ) ) {
      issue.setDescriptions(shortDescription, longDescription)
    }

    issue.Value = issue.IssueType.ComparatorWrapper.ValueType.serialize(valueAsObject)

    // Re-open issues that are inactive
    if (not issue.Active) {
      issue.Active = true
      issue.addCreateHistory(AutomaticOperationCause)
    }
    return issue
  }

  /**
   * N.B. Intentionally does *not* set Active to true, and if a new UWIssue is created, it is set
   * :Active = false, so that the caller can use .Active to determine whether the issue was previously Active.
   */
  private function findOrCreateIssue(issueTypeCode : String, key : String) : UWIssue {
    var type = UWIssueType.finder.findUWIssueTypeByCode( issueTypeCode )
    if (type == null) {
      throw new IllegalArgumentException("Code ${issueTypeCode} is not a valid code for a UWIssueType")
    }
    var issueVL = _preExistingIssues.get(type).get(key)

    if (issueVL != null) {
      return initializeFoundIssue(issueVL)
    } else {
      return createIssueAsInactive(type, key)
    }
  }

  private function initializeFoundIssue(issueVL : UWIssueVersionList) : UWIssue {
    _untouchedIssues.remove(issueVL)

    // Find the issue as of the slice date, but if one isn't there we need to clone the first
    // version in the list and then explicitly set it's eff/exp window so that it starts on the slice date and
    // ends either as of the start of the next version of the issue or, if there is no next issue, at the period end
    var issue = issueVL.AsOf(_period.SliceDate)
    if (issue == null) {
      var nextIssue = issueVL.AllVersions.firstWhere(\i -> i.EffectiveDate > _period.SliceDate)
      issue = issueVL.AllVersions.first().clone()
      issue.setEffectiveWindow(_period.SliceDate, nextIssue == null ? _period.PeriodEnd : nextIssue.EffectiveDate)
      issue = issue.getSlice(_period.SliceDate)
      issue.HasApprovalOrRejection = false //don't clone an approval when cloning the issue
      issue.Active = false   //signal to our caller that they need to create a history
    } else {
      issue = issue.getSlice(_period.SliceDate)
    }
    return issue
  }

  private function createIssueAsInactive(type : UWIssueType, key : String) : UWIssue {
    var issue = new UWIssue(_period){:IssueType = type, :IssueKey = key, :Active = false}
    _period.addToUWIssuesIncludingSoftDeleted(issue)

    // Also add it to the context map so we find it next time we look for an issue with this key
    _preExistingIssues[type].put(key, issue.VersionList)

    return issue
  }

  /**
   * Removes, or marks as inactive, all issues that existed at the time this context object was created
   * and which were not touched by a call to the addIssue method.
   * Issues that are open or marked no longer applicable will simply be removed by this method,
   * whereas issues that are approved, declined, or "human touched" will be marked inactive.
   */
  function removeOrphanedIssues() {
    for (issueVL in _untouchedIssues) {
      // Since the issue may or may not exist at this point in effective time, we need to first check
      // and then only deactive the issue as of that point in time if there is such an issue
      var issue = issueVL.AsOf(_period.SliceDate)
      if (issue != null) {
        issue.getSlice(_period.SliceDate).deactivate(AutomaticOperationCause)
      }
    }
  }
}