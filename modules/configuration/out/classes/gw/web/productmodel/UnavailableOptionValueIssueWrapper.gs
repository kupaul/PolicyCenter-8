package gw.web.productmodel

/**
 * Wrapper for unavailable option value issues.  Unavailable option value issues are fixed as part of a normal sync but not as
 * part of a quote, as we want to force the user to explicitly choose a new value prior to quoting.  
 * In either case, the issue is always displayed.
 */
@Export
class UnavailableOptionValueIssueWrapper extends ProductModelSyncIssueWrapper<gw.api.web.productmodel.UnavailableOptionValueIssue> {

  construct(myIssue : gw.api.web.productmodel.UnavailableOptionValueIssue) {
    super(myIssue)
  }
  
  override property get BaseMessage() : String {
    return displaykey.Web.JobWizard.ProductModelSync.UnavailableOptionValue(Issue.Option.DisplayName, Issue.CovTerm.Pattern.DisplayName, Issue.Option.CovTermPattern.ClausePattern.DisplayName)
  }

  override property get Severity() : ProductModelSyncIssueSeverity {
    if (Issue.Fixed) {
      return WARNING  
    } else {
      return ERROR
    }
  }
  
  override property get ShouldFixDuringNormalSync() : boolean { return true }
  
  override property get ShouldDisplayDuringNormalSync() : boolean { return true }
  
  override property get ShouldFixDuringQuote() : boolean { return false }
  
  override property get ShouldDisplayDuringQuote() : boolean { return true }
}
