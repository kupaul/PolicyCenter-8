package gw.policy
uses java.util.Date
uses gw.api.database.Query
uses gw.plugin.policyperiod.IPolicyPeriodPlugin
uses gw.plugin.Plugins

enhancement PolicyPeriodSummaryEnhancement : PolicyPeriodSummary {
  
  /**
   * Equivalent to PolicyPeriod.PeriodDisplayStatus
   */
  property get PeriodDisplayStatus() : String {
    return PolicyPeriod.getPeriodDisplayStatus(Date.CurrentDate, this.Status, this.CancellationDate, this.PeriodStart, this.PeriodEnd)
  }
 
  /**
   * Fetches the corresponding PolicyPeriod for this summary
   */
  function fetchPolicyPeriod() : PolicyPeriod {
    var query = Query.make(PolicyPeriod)
    query.compare("ID", Equals, this.PolicyPeriodId)
    return query.select().single()
  }

  public property get PolicyNumberDisplayString(): String {
    return this.PolicyNumberAssigned ? this.PolicyNumber : displaykey.EntityName.PolicyPeriodSummary.Unassigned
  }

  public property get PolicyNumberAssigned(): boolean {
    return this.PolicyNumber <> null
  }
}
