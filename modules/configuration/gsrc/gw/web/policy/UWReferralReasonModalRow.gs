package gw.web.policy

@Export
class UWReferralReasonModalRow extends ModalRow<UWReferralReason> {

  private var _userCanApproveIssue : boolean as UserCanApproveIssue = false
  private var _userCanApproveAllIssues : boolean as UserCanApproveAllIssues = false
  
  property get Open() : ButtonVisibility {
    return Item.Open ? Hidden : Clickable
  }
  
  property get Close() : ButtonVisibility {
    return ButtonVisibility.of(Item.Open, Item.Open and UserCanApproveIssue)
  }

  property get SpecialClose() : ButtonVisibility {
    /*
     * When to show the special close button
     *   1- User has the special permission
     *   2- The Close button is visible (i.e., the issue is in a state where it *could* be approved)
     *   3- The Close button is grayed out (i.e., the user does not have sufficient authority to approve it)
     */
    var enable = _userCanApproveAllIssues and Close == GrayedOut
    return enable ? Clickable : Hidden
  }

  function openReferralReasonAndCommit() {
    Item.Open = true
    Item.Bundle.commit()
  }
  
  function closeReferralReasonAndCommit() {
    Item.Open = false
    Item.Bundle.commit()
  }

  property get FormattedValue() : String {
    return IsItem ? Item.FormattedValue : null
  }

  property get BlockingPoint() : UWIssueBlockingPoint {
    return IsItem ? Item.IssueType.BlockingPoint : null
  }
}
