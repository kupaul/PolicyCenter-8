package gw.lob.bop
uses gw.api.domain.ModifierAdapter

@Export
class BOPModifierAdapter implements ModifierAdapter
{
  var _owner : BOPModifier
  
  construct(modifier : BOPModifier) {
    _owner = modifier
  }
  
  override property get OwningModifiable() : Modifiable {
    return _owner.BOPLine
  }
  
  override property get RateFactors() : RateFactor[] {
    return _owner.BOPRateFactors
  }

  override function addToRateFactors(element : RateFactor) {
    _owner.addToBOPRateFactors(element as BOPRateFactor)
  }

  override function removeFromRateFactors(element : RateFactor) {
    _owner.removeFromBOPRateFactors(element as BOPRateFactor)
  }

  override function createRawRateFactor() : RateFactor {
    return new BOPRateFactor(_owner.BOPLine.Branch)
  }
}
