package gw.lob.pa
uses gw.api.domain.ModifierAdapter

@Export
class PAVehicleModifierAdapter implements ModifierAdapter
{
  var _owner : PAVehicleModifier
  
  construct(modifier : PAVehicleModifier) {
    _owner = modifier
  }
  
  override property get OwningModifiable() : Modifiable {
    return _owner.PAVehicle
  }
  
  override property get RateFactors() : RateFactor[] {
    return _owner.PAVehicleRateFactors
  }

  override function addToRateFactors(element : RateFactor) {
    _owner.addToPAVehicleRateFactors(element as PAVehicleRateFactor)
  }

  override function removeFromRateFactors(element : RateFactor) {
    _owner.removeFromPAVehicleRateFactors(element as PAVehicleRateFactor)
  }

  override function createRawRateFactor() : RateFactor {
    return new PAVehicleRateFactor(_owner.PAVehicle.Branch)
  }
}
