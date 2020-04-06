package gw.web.productmodel

/**
 * Wrapper class for missing suggested condition issues.  Missing suggested condition issues
 * are never fixed automatically and are never displayed in the UI.  Note that missing
 * suggested conditions will still be added when a coverable entity first has its conditions
 * created, however.
 */
@Export
class MissingSuggestedConditionIssueWrapper extends ProductModelSyncIssueWrapper<gw.api.web.productmodel.MissingSuggestedConditionIssue> {

  construct(myIssue : gw.api.web.productmodel.MissingSuggestedConditionIssue) {
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
