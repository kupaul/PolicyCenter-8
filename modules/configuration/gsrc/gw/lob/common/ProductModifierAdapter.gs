package gw.lob.common
uses gw.api.domain.ModifierAdapter

@Export
class ProductModifierAdapter implements ModifierAdapter
{
  var _owner : ProductModifier
  
  construct(modifier : ProductModifier) {
    _owner = modifier
  }
  
  override property get OwningModifiable() : Modifiable {
    return _owner.EffectiveDatedFields
  }
  
  override property get RateFactors() : RateFactor[] {
    return _owner.ProductRateFactors
  }

  override function addToRateFactors(element : RateFactor) {
    _owner.addToProductRateFactors(element as ProductRateFactor)
  }

  override function removeFromRateFactors(element : RateFactor) {
    _owner.removeFromProductRateFactors(element as ProductRateFactor)
  }

  override function createRawRateFactor() : RateFactor {
    return new ProductRateFactor(_owner.EffectiveDatedFields.Branch)
  }
}
