package gw.web.productmodel

/**
 * Wrapper for unavailable cov term issues.  Unavailable cov term issues are always fixed and always displayed.
 */
@Export
class UnavailableCovTermIssueWrapper extends ProductModelSyncIssueWrapper<gw.api.web.productmodel.UnavailableCovTermIssue> {

  construct(myIssue : gw.api.web.productmodel.UnavailableCovTermIssue) {
    super(myIssue)
  }
  
  override property get BaseMessage() : String {
    return displaykey.Web.JobWizard.ProductModelSync.UnavailableCovTermRemoved(Issue.Pattern.DisplayName, Issue.Pattern.ClausePattern.DisplayName)
  }

  override property get Severity() : ProductModelSyncIssueSeverity {
    return INFO  
  }
  
  override property get ShouldFixDuringNormalSync() : boolean { return true }
  
  override property get ShouldDisplayDuringNormalSync() : boolean { return true }
  
  override property get ShouldFixDuringQuote() : boolean { return true }
  
  override property get ShouldDisplayDuringQuote() : boolean { return true }
}
