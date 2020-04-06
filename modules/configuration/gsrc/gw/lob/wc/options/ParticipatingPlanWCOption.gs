package gw.lob.wc.options

@Export
class ParticipatingPlanWCOption extends WCOption {

  construct(policyPeriod : PolicyPeriod) {
    super(policyPeriod)
  }

  override property get Label() : String {
    return displaykey.Web.Policy.WC.ParticipatingPlan
  }

  override property get Mode() : String {
    return "ParticipatingPlan"
  }

  override function addToPolicy() {
    WCLine.HasParticipatingPlan = true
  }

  override function removeFromPolicy() {
    WCLine.HasParticipatingPlan = false
  }

  override function isOnPolicy() : boolean {
    return WCLine.HasParticipatingPlan
  }
}