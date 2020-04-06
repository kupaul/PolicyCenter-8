package gw.lob.ba
uses gw.api.domain.ModifierAdapter
uses java.lang.UnsupportedOperationException

@Export
class BusinessVehicleModifierAdapter implements ModifierAdapter
{
  var _owner : BusinessVehicleModifier
  
  construct(modifier : BusinessVehicleModifier) {
    _owner = modifier
  }
  
  override property get OwningModifiable() : Modifiable {
    return _owner.Vehicle
  }
  
  override property get RateFactors() : RateFactor[] {
    throw new UnsupportedOperationException(displaykey.ModifierAdapter.Error.BAVehicleRateFactorsNotDefined)
  }

  override function addToRateFactors(element : RateFactor) {
    throw new UnsupportedOperationException(displaykey.ModifierAdapter.Error.BAVehicleRateFactorsNotDefined)
  }

  override function removeFromRateFactors(element : RateFactor) {
    throw new UnsupportedOperationException(displaykey.ModifierAdapter.Error.BAVehicleRateFactorsNotDefined)
  }

  override function createRawRateFactor() : RateFactor {
    throw new UnsupportedOperationException(displaykey.ModifierAdapter.Error.BAVehicleRateFactorsNotDefined)
  }
}