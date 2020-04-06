package gw.web.productmodel

/**
 * Wrapper class for missing suggested exclusion issues.  Missing suggested exclusion issues
 * are never fixed automatically and are never displayed in the UI.  Note that missing
 * suggested exclusions will still be added when a coverable entity first has its exclusions
 * created, however.
 */
@Export
class MissingSuggestedExclusionIssueWrapper extends ProductModelSyncIssueWrapper<gw.api.web.productmodel.MissingSuggestedExclusionIssue> {

  construct(myIssue : gw.api.web.productmodel.MissingSuggestedExclusionIssue) {
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
