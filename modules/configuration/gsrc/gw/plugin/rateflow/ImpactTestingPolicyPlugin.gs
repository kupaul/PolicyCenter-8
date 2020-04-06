package gw.plugin.rateflow

uses gw.plugin.policy.impl.PolicyPlugin


@Export
class ImpactTestingPolicyPlugin extends PolicyPlugin {
  
  override function canStartRenewal( policy: Policy ) : String {
    //Return null to allow renewal
    return null
  }

}
