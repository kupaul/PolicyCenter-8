package gw.lob.cp
uses gw.api.domain.ModifierAdapter

@Export
class CPModifierAdapter implements ModifierAdapter
{
  var _owner : CPModifier
  
  construct(modifier : CPModifier) {
    _owner = modifier
  }
  
  override property get OwningModifiable() : Modifiable {
    return _owner.CPLine
  }
  
  override property get RateFactors() : RateFactor[] {
    return _owner.CPRateFactors
  }

  override function addToRateFactors(element : RateFactor) {
    _owner.addToCPRateFactors(element as CPRateFactor)
  }

  override function removeFromRateFactors(element : RateFactor) {
    _owner.removeFromCPRateFactors(element as CPRateFactor)
  }

  override function createRawRateFactor() : RateFactor {
    return new CPRateFactor(_owner.CPLine.Branch)
  }
}
