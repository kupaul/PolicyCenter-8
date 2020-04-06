package gw.lob.gl
uses gw.api.domain.ModifierAdapter

@Export
class GLModifierAdapter implements ModifierAdapter
{
  var _owner : GLModifier
  
  construct(modifier : GLModifier) {
    _owner = modifier
  }
  
  override property get OwningModifiable() : Modifiable {
    return _owner.GLLine
  }
  
  override property get RateFactors() : RateFactor[] {
    return _owner.GLRateFactors
  }

  override function addToRateFactors(element : RateFactor) {
    _owner.addToGLRateFactors(element as GLRateFactor)
  }

  override function removeFromRateFactors(element : RateFactor) {
    _owner.removeFromGLRateFactors(element as GLRateFactor)
  }

  override function createRawRateFactor() : RateFactor {
    return new GLRateFactor(_owner.GLLine.Branch)
  }
}
