package gw.lob.wc
uses gw.api.domain.ModifierAdapter

@Export
class WCModifierAdapter implements ModifierAdapter
{
  var _owner : WCModifier
  
  construct(modifier : WCModifier) {
    _owner = modifier
  }
  
  override property get OwningModifiable() : Modifiable {
    return _owner.WCJurisdiction
  }
  
  override property get RateFactors() : RateFactor[] {
    return _owner.WCRateFactors
  }

  override function addToRateFactors(element : RateFactor) {
    _owner.addToWCRateFactors(element as WCRateFactor)
  }

  override function removeFromRateFactors(element : RateFactor) {
    _owner.removeFromWCRateFactors(element as WCRateFactor)
  }

  override function createRawRateFactor() : RateFactor {
    return new WCRateFactor(_owner.WCJurisdiction.Branch)
  }
}
