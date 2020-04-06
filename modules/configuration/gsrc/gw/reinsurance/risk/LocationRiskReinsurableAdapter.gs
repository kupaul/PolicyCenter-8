package gw.reinsurance.risk

uses gw.api.reinsurance.ReinsurableAdapter
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class LocationRiskReinsurableAdapter implements ReinsurableAdapter {
  var _owner : LocationRisk

  construct(owner : LocationRisk) {
    _owner = owner
  }

  override property get Coverable() : ReinsurableCoverable {
    return _owner.Location typeis ReinsurableCoverable ? _owner.Location : null
  }

}
