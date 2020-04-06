package gw.pcf.rating.rateroutine

@Export
class RateRoutineInstructionUIHelper {
  var _step : CalcStepDefinition as Step

  construct(step : CalcStepDefinition) {
    _step = step
  }

  function resetStepAndSetDefaultOperatorType() {
    Step.StepType = TC_ASSIGNMENT
    Step.InScopeParam = null
    Step.InScopeValue = null
    Step.StoreLocation = null
    if (Step.Operands.Count > 0) {
      Step.PrimaryOperand.OperatorType = TC_STORE
    }
  }
}