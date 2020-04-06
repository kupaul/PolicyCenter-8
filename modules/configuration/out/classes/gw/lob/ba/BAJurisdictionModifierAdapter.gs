package gw.lob.ba
uses gw.api.domain.ModifierAdapter

@Export
class BAJurisdictionModifierAdapter implements ModifierAdapter {
  var _owner : BAJurisModifier
  construct(owner : BAJurisModifier) {
    _owner = owner
  }

  override property get OwningModifiable() : Modifiable {
    return _owner.Jurisdiction
  }

  override property get RateFactors() : RateFactor[] {
    return _owner.BAJurisRateFactors
  }

  override function addToRateFactors(p0 : RateFactor) {
    _owner.addToBAJurisRateFactors(p0 as BAJurisRateFactor)
  }

  override function createRawRateFactor() : RateFactor {
    return new BAJurisRateFactor(_owner.Branch)
  }

  override function removeFromRateFactors(p0 : RateFactor) {
    _owner.removeFromBAJurisRateFactors(p0 as BAJurisRateFactor)
  }

}
