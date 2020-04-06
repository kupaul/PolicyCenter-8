package gw.web.policy

@Export
class RiskEvaluationPanelSetModalRow extends ModalRow<UWIssue> {

  private var _canReopen : boolean as CanReopen
  private var _canReject : boolean as CanReject
  private var _userCanApproveIssue : boolean as UserCanApproveIssue
  private var _userCanApproveAllIssues : boolean as UserCanApproveAllIssues

  property get SpecialApprove() : ButtonVisibility {
    /*
     * When to show the special approve button
     *   1- User has the special permission
     *   2- The Approve button is visible (i.e., the issue is in a state where it *could* be approved)
     *   3- The Approve button is grayed out (i.e., the user does not have sufficient authority to approve it)
     */
    var enable = _userCanApproveAllIssues and Approve == GrayedOut
    return enable ? Clickable : Hidden
  }

  property get Approve() : ButtonVisibility {
    var visible = IsApprovableIssue
    return ButtonVisibility.of(visible, visible and _userCanApproveIssue)
  }

  property get Reject() : ButtonVisibility {
    var visible = IsApprovableIssue or IsRejectableInformationalIssue
    return ButtonVisibility.of(visible, visible and _canReject)
  }

  property get Reopen() : ButtonVisibility {
    var visible = Item.HasApprovalOrRejection
    return ButtonVisibility.of(visible, visible and (_canReopen or _userCanApproveIssue))
  }

  property get FormattedValue() : String {
    if (IsItem) {
      return formatValue(Item)
    } else {
      return null
    }
  }

  private property get IsApprovableIssue() : boolean {
    return IsItem and Item.isBlocking("BlocksIssuance") and Item.CurrentBlockingPoint != UWIssueBlockingPoint.TC_REJECTED
  }

  private property get IsRejectableInformationalIssue() : boolean {
    return IsItem and Item.IssueType.BlockingPoint == "NonBlocking" and Item.CurrentBlockingPoint != UWIssueBlockingPoint.TC_REJECTED
  }

  static function formatValue(issue : UWIssue) : String {
    var unmarkedValue = issue.Value == null ? "" : issue.FormattedValue
    var marker = not issue.ValueVariesAcrossSlices 
        ? unmarkedValue
        : issue.IssueBlocksAtSomeSlice 
            ? displaykey.Web.Policy.EvaluationIssues.IssueValueVariesInTime(unmarkedValue)
            : displaykey.Web.Policy.EvaluationIssues.IssueValueVariesInTimeWithoutBlocking(unmarkedValue)
    return marker
  }

}
