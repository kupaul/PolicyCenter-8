package gw.web.productmodel

/**
 * Wrapper for unavailable rate factor issues.  Unavailable rate factor issues are always fixed and always displayed.
 */
@Export
class UnavailableRateFactorIssueWrapper extends ProductModelSyncIssueWrapper<gw.api.web.productmodel.UnavailableRateFactorIssue> {

  construct(myIssue : gw.api.web.productmodel.UnavailableRateFactorIssue) {
    super(myIssue)
  }
  
  override property get BaseMessage() : String {
    return displaykey.Web.JobWizard.ProductModelSync.UnavailableRateFactorRemoved(Issue.Pattern.DisplayName,Issue.Modifier.DisplayName)
  }

  override property get Severity() : ProductModelSyncIssueSeverity {
    return INFO  
  }
  
  override property get ShouldFixDuringNormalSync() : boolean { return true }
  
  override property get ShouldDisplayDuringNormalSync() : boolean { return true }
  
  override property get ShouldFixDuringQuote() : boolean { return true }
  
  override property get ShouldDisplayDuringQuote() : boolean { return true }
}
