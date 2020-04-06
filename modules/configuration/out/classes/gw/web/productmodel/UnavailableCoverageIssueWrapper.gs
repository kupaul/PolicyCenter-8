package gw.web.productmodel

/**
 * Wrapper for unavailable coverage issues. Unavailable coverage issues are always fixed and are always displayed.
 */
@Export
class UnavailableCoverageIssueWrapper extends ProductModelSyncIssueWrapper<gw.api.web.productmodel.UnavailableCoverageIssue> {
  
  construct(myIssue : gw.api.web.productmodel.UnavailableCoverageIssue) {
    super(myIssue)
  }

  override property get BaseMessage() : String {
    return displaykey.Web.JobWizard.ProductModelSync.UnavailableClauseRemoved(Issue.Pattern.DisplayName)
  }

  override property get Severity() : ProductModelSyncIssueSeverity {
    return WARNING  
  }

  override property get ShouldFixDuringNormalSync() : boolean { return true }
  
  override property get ShouldDisplayDuringNormalSync() : boolean { return true }
  
  override property get ShouldFixDuringQuote() : boolean { return true }
  
  override property get ShouldDisplayDuringQuote() : boolean { return true }

}
