package gw.reinsurance.risk

uses gw.api.reinsurance.ReinsurableAdapter
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class PolicyRiskReinsurableAdapter implements ReinsurableAdapter {
  var _owner : PolicyRisk

  construct(owner : PolicyRisk) {
    _owner = owner
  }

  override property get Coverable() : ReinsurableCoverable {
    return _owner.Branch typeis ReinsurableCoverable ? _owner.Branch : null
  }

}