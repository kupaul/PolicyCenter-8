package gw.pcf.rating.flow

@Export
class RateRoutineUsageHelper {

  private static function isConditionalSubOperand(aValueDelegate: CalcStepValueDelegate): boolean {
    return aValueDelegate typeis CalcStepDefinitionOperand and aValueDelegate.OperandOrder <> 0
  }

  static function getValueDelegateUsage(aValueDelegate: CalcStepValueDelegate): String {
    if (isConditionalSubOperand(aValueDelegate))
      return displaykey.Web.Rating.Flow.CalcRoutine.Usage.ConditionalOperand
    return (aValueDelegate typeis CalcStepDefinitionOperand)? displaykey.Web.Rating.Flow.CalcRoutine.Usage.Operand : displaykey.Web.Rating.Flow.CalcRoutine.Usage.Argument
  }  
}