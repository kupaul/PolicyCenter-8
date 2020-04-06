package gw.lob.pa
uses gw.api.domain.RateFactorAdapter

@Export
class PAVehicleRateFactorAdapter implements RateFactorAdapter
{
  var _owner : PAVehicleRateFactor
  
  construct(rateFactor : PAVehicleRateFactor) {
    _owner = rateFactor
  }

  override property get Modifier() : Modifier {
    return _owner.PAVehicleModifier
  }
}
