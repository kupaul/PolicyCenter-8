package gw.lob.pa
uses gw.api.domain.ModifierAdapter

@Export
class PAModifierAdapter implements ModifierAdapter
{
  var _owner : PAModifier
  
  construct(modifier : PAModifier) {
    _owner = modifier
  }
  
  override property get OwningModifiable() : Modifiable {
    return _owner.PALine
  }
  
  override property get RateFactors() : RateFactor[] {
    return _owner.PARateFactors
  }

  override function addToRateFactors(element : RateFactor) {
    _owner.addToPARateFactors(element as PARateFactor)
  }

  override function removeFromRateFactors(element : RateFactor) {
    _owner.removeFromPARateFactors(element as PARateFactor)
  }

  override function createRawRateFactor() : RateFactor {
    return new PARateFactor(_owner.PALine.Branch)
  }
}
