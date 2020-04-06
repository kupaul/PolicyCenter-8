package gw.lob.gl
uses gw.api.domain.RateFactorAdapter

@Export
class GLRateFactorAdapter implements RateFactorAdapter
{
  var _owner : GLRateFactor
  
  construct(rateFactor : GLRateFactor) {
    _owner = rateFactor
  }

  override property get Modifier() : Modifier {
    return _owner.GLModifier
  }
}
