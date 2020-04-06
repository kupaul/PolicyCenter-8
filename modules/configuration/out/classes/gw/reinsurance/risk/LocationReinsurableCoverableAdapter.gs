package gw.reinsurance.risk
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class LocationReinsurableCoverableAdapter implements ReinsurableCoverable {
  protected var _owner : PolicyLocation

  construct(owner : PolicyLocation) {
    _owner = owner
  }

  override function createReinsurableRisk() : Reinsurable {
    var risk = new LocationRisk(_owner.Branch)
    risk.Location = _owner
    // denormalized field, used for Proximity Search
    risk.AccountLocation = _owner.AccountLocation
    return risk
  }

  override function isTheSame(other : ReinsurableCoverable) : boolean {
    return other typeis PolicyLocation and _owner.AccountLocation == other.AccountLocation
  }

  override property get Reinsurables() : Reinsurable[] {
    return _owner.LocationRisks
  }

}
