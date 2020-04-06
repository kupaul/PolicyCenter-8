package gw.pcf.rating.flow

uses gw.lang.reflect.TypeSystem
uses gw.rating.flow.LocalVariable
uses gw.util.Pair
uses java.util.LinkedHashMap
uses java.util.Map
uses gw.api.util.DisplayableException

@Export
class RateRoutineConditionalPopupHelper {

  private var _currentLocation : pcf.RateRoutineConditionalPopup
  private var _operand : CalcStepDefinitionOperand
  private var _routine : CalcRoutineDefinition

  construct(currentLocation : pcf.RateRoutineConditionalPopup, operand : CalcStepDefinitionOperand, routine: CalcRoutineDefinition) {
    _currentLocation = currentLocation
    _operand = operand
    _routine = routine
  }

  function commitPopup(availLocalVars : List<LocalVariable>) {
    removeUnusedLogicalNots(availLocalVars)
    clearFirstSubOperandOperator()
    _currentLocation.commit()
  }

  function checkForUnbalancedParentheses() {
    var balance = 0
    for (op in _operand.ConditionalSubOperands) {
      balance += (op.First.LeftParenthesisGroup   ?: "").countMatches("(")
      balance -= (op.First.RightParenthesisGroup  ?: "").countMatches(")")
      if (balance < 0) break // always report if there's an underflow
      balance += (op.Second.LeftParenthesisGroup  ?: "").countMatches("(")
      balance -= (op.Second.RightParenthesisGroup ?: "").countMatches(")")
      if (balance < 0) break // always report if there's an underflow
    }

    if (balance > 0) {
      throw new DisplayableException(displaykey.Web.Rating.Errors.MissingCloseParen)
    } else if (balance < 0) {
      throw new DisplayableException(displaykey.Web.Rating.Errors.MissingOpenParen)
    }
  }

  // Currently we do no deduce the types of local variables.  For now, we will blindly allow the NOT operator
  // to be applied to local variables... this method will hopefully disappear and the caller will use
  // isBoolean exclusively when we keep track of var types.
  static function mightBeBoolean(conditionalSubOperand : CalcStepDefinitionOperand, availLocalVars : List<LocalVariable>) : Boolean {
    // If it's local variable but not a multifactor variable or a field from complex type, it might be a boolean
    if (conditionalSubOperand.OperandType == TC_LOCALVAR) {
      var localVar = availLocalVars.firstWhere(\lv ->conditionalSubOperand.VariableName == lv.VariableName
                                                      and conditionalSubOperand.VariableFieldName == lv.FieldName)
      if (localVar.VarType == null) {
        return true
      } else {
        return java.lang.Boolean.Type.isAssignableFrom(localVar.VarType)
            or java.lang.Boolean.Type.isAssignableFrom(TypeSystem.getBoxType(localVar.VarType))
      }
    } else {
      // else trust the target's IsBoolean
      return conditionalSubOperand.IsBoolean
    }
  }

  static function showFreeFormOperand(conditionalOperand : Pair<entity.CalcStepDefinitionOperand, entity.CalcStepDefinitionOperand>) : boolean {
    if(conditionalOperand.Second.OperandType == null) { // nothing selected in right operand
      return conditionalOperand.First.isComparableToConstantInsideConditional()
    } else {
      return conditionalOperand.Second.IsEditableConstant
    }
  }

  function parseRateTables() : Map<String,String> {
    var tabCodeNameMap = new LinkedHashMap<String,String>()
    var rTables = _operand.CalcStep.CalcRoutineDefinition.availableTables()
    if (rTables.Count > 0) {
      rTables.each(\rt -> tabCodeNameMap.put(rt.TableCode, rt.TableName))
    }
    return tabCodeNameMap
  }

  function getParamType(arg : CalcStepDefinitionArgument) : String {
    var valProvider = arg.FirstMatchingRateTableColumn.ValueProvider
    if (valProvider == null) {
      return arg.ColumnDataType.toString()
    }
    return "List"
  }

  // -- Private Helper Methods -- //

  // During conditional construction, we just hide the logical not if it isn't logically usable.
  // Before heading back to the step view, clear out the actual backing values for those conditional suboperands
  // for which logical not should not be allowed.
  private function removeUnusedLogicalNots(availLocalVars : List<LocalVariable>) {
    _operand.CalcStep.Operands.where(\o -> o.OperandOrder > 0 and (not mightBeBoolean(o, availLocalVars)))
                              .each(\o -> {o.LogicalNot = false})
  }

  // Is there a more efficient way to do this?
  private function clearFirstSubOperandOperator() {
    _operand.CalcStep.Operands.where(\op -> op.OperandOrder == 1)
                              .each(\op -> {op.OperatorType = null})
  }
}
