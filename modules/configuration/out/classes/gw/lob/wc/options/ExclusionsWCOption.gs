package gw.lob.wc.options

@Export
class ExclusionsWCOption extends WCOption {

  construct(policyPeriod : PolicyPeriod) {
    super(policyPeriod)
  }

  override property get Label() : String {
    return displaykey.Web.Policy.WC.WCExcludedWorkplace
  }

  override property get Mode() : String {
    return "Exclusions"
  }

  override function addToPolicy() {
    WCLine.HasWCExcludedWorkplace = true
  }

  override function removeFromPolicy() {
    WCLine.HasWCExcludedWorkplace = false
  }

  override function isOnPolicy() : boolean {
    return WCLine.HasWCExcludedWorkplace
  }
}