package gw.lob.wc.options

@Export
class WaiversOfSubrogationWCOption extends WCOption {

  construct(policyPeriod : PolicyPeriod) {
    super(policyPeriod)
  }

  override property get Label() : String {
    return displaykey.Web.Policy.WC.WaiversOfSubrogation
  }

  override property get Mode() : String {
    return "WaiversOfSubrogation"
  }

  override function addToPolicy() {
  }

  override function removeFromPolicy() {
    for (waiver in WCLine.WCWaiverOfSubros) {
      WCLine.removeFromWCWaiverOfSubros(waiver)
    }
  }

  override function isOnPolicy() : boolean {
    return WCLine.HasWCWaiverofSubro
  }
}