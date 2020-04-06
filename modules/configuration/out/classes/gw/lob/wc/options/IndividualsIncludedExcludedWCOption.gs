package gw.lob.wc.options

@Export
class IndividualsIncludedExcludedWCOption extends WCOption {

  construct(policyPeriod : PolicyPeriod) {
    super(policyPeriod)
  }

  override property get Label() : String {
    return displaykey.Web.Policy.WC.InclExclShort
  }

  override property get Mode() : String {
    return "IndividualsIncludedExcluded"
  }

  override function addToPolicy() {
    WCLine.HasInclExclIndividuals = true
  }

  override function removeFromPolicy() {
    WCLine.HasInclExclIndividuals = false
  }

  override function isOnPolicy() : boolean {
    return WCLine.HasInclExclIndividuals
  }
}