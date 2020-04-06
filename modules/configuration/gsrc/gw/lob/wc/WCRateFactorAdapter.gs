package gw.lob.wc
uses gw.api.domain.RateFactorAdapter

@Export
class WCRateFactorAdapter implements RateFactorAdapter
{
  var _owner : WCRateFactor
  
  construct(rateFactor : WCRateFactor) {
    _owner = rateFactor
  }

  override property get Modifier() : Modifier {
    return _owner.WCModifier
  }
}
