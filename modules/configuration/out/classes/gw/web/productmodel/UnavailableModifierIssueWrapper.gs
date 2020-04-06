package gw.web.productmodel

/**
 * Wrapper for unavailable modifier issues.  Unavailable modifier issues are always fixed and always displayed.
 */
@Export
class UnavailableModifierIssueWrapper extends ProductModelSyncIssueWrapper<gw.api.web.productmodel.UnavailableModifierIssue> {

  construct(myIssue : gw.api.web.productmodel.UnavailableModifierIssue) {
    super(myIssue)
  }
  
  override property get BaseMessage() : String {
    return displaykey.Web.JobWizard.ProductModelSync.UnavailableModifierRemoved(Issue.Pattern.DisplayName) 
  }

  override property get Severity() : ProductModelSyncIssueSeverity {
    return INFO  
  }
  
  override property get ShouldFixDuringNormalSync() : boolean { return true }
  
  override property get ShouldDisplayDuringNormalSync() : boolean { return true }
  
  override property get ShouldFixDuringQuote() : boolean { return true }
  
  override property get ShouldDisplayDuringQuote() : boolean { return true }
}
