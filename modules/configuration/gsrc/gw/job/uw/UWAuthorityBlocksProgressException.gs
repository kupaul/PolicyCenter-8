package gw.job.uw

@Export
class UWAuthorityBlocksProgressException extends java.lang.RuntimeException {
  var _blockingIssues : UWIssue[] as readonly BlockingIssues
  construct(blockingIssuesArg : UWIssue[]) {
    _blockingIssues = blockingIssuesArg
  }

  override function toString() : String {
    return BlockingIssues.map(\ i -> "UWIssue: ${i.IssueType.Code} ${i.FormattedValueAsCondition}: ${i}").join("\n")
  }
}
