package gw.lob.wc.options

@Export
class FederalLiabilityWCOption extends WCOption {

  construct(policyPeriod : PolicyPeriod) {
    super(policyPeriod)
  }
  
  override property get Label() : String {
    return displaykey.Web.Policy.WC.FederalLiability
  }
  
  override property get Mode() : String {
    return "FederalLiability"
  }
  
  override function addToPolicy() {
    WCLine.setCoverageExists("WCFedEmpLiabCov", true)
  }
  
  override function removeFromPolicy() {
    WCLine.setCoverageExists("WCFedEmpLiabCov", false) 
    for (emp in WCLine.WCFedCoveredEmployees) {
      WCLine.removeFromWCFedCoveredEmployees(emp)
    }
  }
  
  override function isOnPolicy() : boolean {
    return WCLine.WCFedEmpLiabCovExists
  }
}