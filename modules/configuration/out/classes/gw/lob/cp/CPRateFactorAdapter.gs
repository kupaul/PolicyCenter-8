package gw.lob.cp
uses gw.api.domain.RateFactorAdapter

@Export
class CPRateFactorAdapter implements RateFactorAdapter
{
  var _owner : CPRateFactor
  
  construct(rateFactor : CPRateFactor) {
    _owner = rateFactor
  }

  override property get Modifier() : Modifier {
    return _owner.CPModifier
  }
}
