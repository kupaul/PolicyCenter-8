package gw.web.productmodel

/**
 * Wrapper class for missing rate factor issues.  Missing rate factor issues are always fixed
 * and never displayed to the user.
 */
@Export
class MissingRateFactorIssueWrapper extends ProductModelSyncIssueWrapper<gw.api.web.productmodel.MissingRateFactorIssue> {

  construct(myIssue : gw.api.web.productmodel.MissingRateFactorIssue) {
    super(myIssue)
  }
  
  override property get BaseMessage() : String {
    return displaykey.Web.JobWizard.ProductModelSync.NoMessageConfigured 
  }

  override property get Severity() : ProductModelSyncIssueSeverity {
    return INFO  
  }
  
  override property get ShouldFixDuringNormalSync() : boolean { return true }
  
  override property get ShouldDisplayDuringNormalSync() : boolean { return false }
  
  override property get ShouldFixDuringQuote() : boolean { return true }
  
  override property get ShouldDisplayDuringQuote() : boolean { return false }
}
