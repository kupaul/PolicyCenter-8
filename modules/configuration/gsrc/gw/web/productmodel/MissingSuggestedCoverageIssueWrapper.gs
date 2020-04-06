package gw.web.productmodel

/**
 * Wrapper class for missing suggested coverage issues.  Missing suggested coverage issues
 * are never fixed automatically and are never displayed in the UI.  Note that missing
 * suggested coverages will still be added when a coverable entity first has its coverages
 * created, however.
 */
@Export
class MissingSuggestedCoverageIssueWrapper extends ProductModelSyncIssueWrapper<gw.api.web.productmodel.MissingSuggestedCoverageIssue> {

  construct(myIssue : gw.api.web.productmodel.MissingSuggestedCoverageIssue) {
    super(myIssue)
  }
  
  override property get BaseMessage() : String {
    return "No message configured"
  }

  override property get Severity() : ProductModelSyncIssueSeverity {
    return INFO  
  }
  
  override property get ShouldFixDuringNormalSync() : boolean { return false }
  
  override property get ShouldDisplayDuringNormalSync() : boolean { return false }
  
  override property get ShouldFixDuringQuote() : boolean { return false }
  
  override property get ShouldDisplayDuringQuote() : boolean { return false }

}
