package gw.lob.ba
uses gw.api.domain.ModifierAdapter

@Export
class BAModifierAdapter implements ModifierAdapter
{
  var _owner : BAModifier
  
  construct(modifier : BAModifier) {
    _owner = modifier
  }
  
  override property get OwningModifiable() : Modifiable {
    return _owner.BALine
  }
  
  override property get RateFactors() : RateFactor[] {
    return _owner.BARateFactors
  }

  override function addToRateFactors(element : RateFactor) {
    _owner.addToBARateFactors(element as BARateFactor)
  }

  override function removeFromRateFactors(element : RateFactor) {
    _owner.removeFromBARateFactors(element as BARateFactor)
  }

  override function createRawRateFactor() : RateFactor {
    return new BARateFactor(_owner.BALine.Branch)
  }
}
