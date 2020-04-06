package gw.job.uw

uses java.util.ArrayList
uses java.util.Collections
uses gw.api.domain.FKLoader

@Export
class UWIssueAutomaticApprovabilityAnalyzer {

  var _autoApprovable : UWIssue[] as readonly AutoApprovable
  var _needManualApproval : UWIssue[] as readonly RequireManualAttention

  var _considerAllIssueTypesAutoApprovable : boolean
  
  construct(issuesArg : UWIssue[], grantsArg : UWAuthorityGrant[], bpArg : UWIssueBlockingPoint) {
    this(issuesArg, grantsArg, bpArg, false)
  }
  
  construct(issuesArg : UWIssue[], grantsArg : UWAuthorityGrant[], bpArg : UWIssueBlockingPoint, 
      considerAllIssueTypesAutoApprovable : boolean) {
    _considerAllIssueTypesAutoApprovable = considerAllIssueTypesAutoApprovable
    initialize(issuesArg, grantsArg, bpArg)
  }

  private function initialize(allIssues : UWIssue[], grants : UWAuthorityGrant[], bp : UWIssueBlockingPoint) {
    var autoApprovableIssues = new ArrayList<UWIssue>()
    var needManualApprovalIssues = new ArrayList<UWIssue>()

    FKLoader.preLoadFKs(grants.toList(), UWIssueType)
    var grantsByType = grants
        .partition(\ grant -> grant.IssueType)
        .toAutoMap(\ issueType -> Collections.emptyList<UWAuthorityGrant>())
    for (issue in allIssues) {
      if (issueIsAutoApprovable(issue, grantsByType[issue.IssueType], bp)) {
        autoApprovableIssues.add(issue)
      } else {
        needManualApprovalIssues.add(issue)
      }
    }
    _autoApprovable = autoApprovableIssues.toTypedArray()
    _needManualApproval = needManualApprovalIssues.toTypedArray()
  }

  private function issueIsAutoApprovable(
      issue : UWIssue, grants : List<UWAuthorityGrant>, defaultApprovalBlockingPointThreshold : UWIssueBlockingPoint) : boolean {
    var issueType = issue.IssueType
    var issueWasNeverManuallyApproved = not issue.HumanTouched
    var approvingIssueWillUnblockProgress 
        = issueType.DefaultApprovalBlockingPoint.comesAfter(defaultApprovalBlockingPointThreshold)
    var grantsSufficientToApproveIssue = issue.canAuthorizeDefaultApprovalValue(grants.toTypedArray())

    return issueWasNeverManuallyApproved
       and approvingIssueWillUnblockProgress
       and doesIssueTypePermitAutoApproval(issueType)
       and grantsSufficientToApproveIssue
  }
  
  private function doesIssueTypePermitAutoApproval(issueType : UWIssueType) : boolean {
    return _considerAllIssueTypesAutoApprovable  //for automated processes
        or issueType.AutoApprovable              //for normal processes
  }
}
