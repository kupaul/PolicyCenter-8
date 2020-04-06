package gw.web.productmodel

/**
 * Wrapper for unavailable condition issues.  Unavailable condition issues are always fixed and are always displayed.
 */
@Export
class UnavailableConditionIssueWrapper extends ProductModelSyncIssueWrapper<gw.api.web.productmodel.UnavailableConditionIssue> {
  
  construct(myIssue : gw.api.web.productmodel.UnavailableConditionIssue) {
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
