package gw.lob.common
uses gw.api.domain.RateFactorAdapter

@Export
class ProductRateFactorAdapter implements RateFactorAdapter
{
  var _owner : ProductRateFactor
  
  construct(rateFactor : ProductRateFactor) {
    _owner = rateFactor
  }

  override property get Modifier() : Modifier {
    return _owner.ProductModifier
  }
}
