package gw.pcf.rating.flow

@Export
class NewRateRoutineHelper {

  static function createNewRoutine() : CalcRoutineDefinition {
    var routine = new CalcRoutineDefinition()
    for (i in 1..10) {
      createNewRow(routine, i)
    }
    return routine
  }
  
  static function createNewRow(routine : CalcRoutineDefinition, rowNum : int) : CalcStepDefinition {
    var newRow = new CalcStepDefinition()
    newRow.SortOrder = rowNum
    newRow.StepType = CalcStepType.TC_ASSIGNMENT
    var operand = new CalcStepDefinitionOperand()
    // when adding a new step, we default to untyped constant
    operand.OperandType = TC_CONSTANT
    operand.OperatorType = null
    newRow.addToOperands(operand)
    routine.addToSteps(newRow)
    return newRow
  }

}
