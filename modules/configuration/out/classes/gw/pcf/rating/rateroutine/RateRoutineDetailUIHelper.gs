package gw.pcf.rating.rateroutine

uses gw.api.util.LocationUtil

@Export
class RateRoutineDetailUIHelper {
  var _rateRoutine : CalcRoutineDefinition as RateRoutine

  construct(rateRoutine : CalcRoutineDefinition) {
    _rateRoutine = rateRoutine
  }

  function performValidation() : boolean {
    var validationMessages = RateRoutine.performPreDisplayValidation()
    for (msg in validationMessages) {
      LocationUtil.addRequestScopedErrorMessage(msg)
    }
    return validationMessages.IsEmpty
  }
}