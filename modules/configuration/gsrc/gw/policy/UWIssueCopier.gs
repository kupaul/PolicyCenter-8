package gw.policy
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class UWIssueCopier extends AbstractEffDatedCopyable<UWIssue> {

  construct(uwIssue : UWIssue) {
    super(uwIssue)
  }

  override function copyBasicFieldsFromBean(uwIssue : UWIssue) {
    _bean.Active = uwIssue.Active
    _bean.ApprovalBlockingPoint = uwIssue.ApprovalBlockingPoint
    _bean.ApprovalDurationType = uwIssue.ApprovalDurationType
    _bean.ApprovalInvalidFrom = uwIssue.ApprovalInvalidFrom
    _bean.ApprovalValue = uwIssue.ApprovalValue
    _bean.ApprovingUser = uwIssue.ApprovingUser
    _bean.AutomaticApprovalCause = uwIssue.AutomaticApprovalCause
    _bean.CanEditApprovalBeforeBind = uwIssue.CanEditApprovalBeforeBind
    _bean.HasApprovalOrRejection = uwIssue.HasApprovalOrRejection
    _bean.ShortDescription = uwIssue.ShortDescription
    _bean.LongDescription = uwIssue.LongDescription
    _bean.Value = uwIssue.Value
    // Not IssueType or IssueKey because they are the match criteria
  }

}
