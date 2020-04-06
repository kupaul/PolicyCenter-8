package gw.pcf.rating.flow
uses gw.pcf.rating.ParameterSetHelper

@Export
class RateRoutineParameterSetHelper extends ParameterSetHelper {

  var _rateRoutine : CalcRoutineDefinition

  private construct() {}

  construct(rateRoutine : CalcRoutineDefinition) {
    _rateRoutine = rateRoutine
  }
  
  function getParamSets() : List<CalcRoutineParameterSet> {
    return getParamSets(getAllParamSets(), _rateRoutine.PolicyLinePatternCode)
  }

  function getHelpStringForParamTypes() : String {
    return getHelpStringForParamTypes(_rateRoutine.ParameterSet)
  }

  function getStringForParamTypes() : String {
    return getStringForParamTypes(_rateRoutine.ParameterSet)
  }

}
