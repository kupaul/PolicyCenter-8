package gw.pcf.rating.rateroutine

uses pcf.api.Location

@Export
class RateRoutineTypekeyConstantUIHelper {
  var _valueDelegate : CalcStepValueDelegate as ValueDelegate
  var _currentLocation : Location as CurrentLocation

  construct(valueDelegate : CalcStepValueDelegate, currentLocation : Location) {
    _valueDelegate = valueDelegate
    _currentLocation = currentLocation
  }

  function commitPopup() {
    if (ValueDelegate typeis CalcStepDefinitionArgument) {
      ValueDelegate.OverrideSource = true
    }
    CurrentLocation.commit()
    gw.api.web.PebblesUtil.invalidateIterators(CurrentLocation, entity.CalcStepDefinition)
  }
}