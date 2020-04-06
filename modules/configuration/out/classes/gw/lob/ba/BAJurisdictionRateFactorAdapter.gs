package gw.lob.ba
uses gw.api.domain.RateFactorAdapter

@Export
class BAJurisdictionRateFactorAdapter implements RateFactorAdapter
{
  var _owner : BAJurisRateFactor
  
  construct(rateFactor : BAJurisRateFactor) {
    _owner = rateFactor
  }

  override property get Modifier() : Modifier {
    return _owner.BAJurisModifier
  }
}