package gw.web.productmodel

/**
 * Wrapper class for missing modifiers.  Missing modifier issues are always fixed automatically and never
 * get displayed to the user.
 */
@Export
class MissingModifierIssueWrapper extends ProductModelSyncIssueWrapper<gw.api.web.productmodel.MissingModifierIssue> {

  construct(myIssue : gw.api.web.productmodel.MissingModifierIssue) {
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
