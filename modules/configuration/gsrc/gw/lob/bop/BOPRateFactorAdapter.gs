package gw.lob.bop
uses gw.api.domain.RateFactorAdapter

@Export
class BOPRateFactorAdapter implements RateFactorAdapter
{
  var _owner : BOPRateFactor
  
  construct(rateFactor : BOPRateFactor) {
    _owner = rateFactor
  }

  override property get Modifier() : Modifier {
    return _owner.BOPModifier
  }
}
