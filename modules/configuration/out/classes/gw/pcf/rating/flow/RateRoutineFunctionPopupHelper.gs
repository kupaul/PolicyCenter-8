package gw.pcf.rating.flow

uses gw.lang.reflect.IType
uses gw.rating.flow.util.RateFlowReflection
uses java.util.Set

@Export
class RateRoutineFunctionPopupHelper {
  private var _popUp : pcf.RateRoutineFunctionPopup
  private var _operand: CalcStepDefinitionOperand
  private var _lineCode : String

  construct(rateFuncPopup : pcf.RateRoutineFunctionPopup, operand: CalcStepDefinitionOperand) {
    _popUp = rateFuncPopup
    _operand = operand
    _lineCode = operand.CalcStep.CalcRoutineDefinition.PolicyLinePatternCode
  }

  function initPopup() {
    
    _operand.changeToOperandType(TC_RATEFUNC)
    
    if(_operand.FunctionName != null) {
      var methodInfo = RateFlowReflection.getMethodInfoForMethod(_operand.CalcStep.CalcRoutineDefinition.PolicyLinePatternCode, _operand.FunctionName)
      if(methodInfo == null) {
        _operand.FunctionName = null
      }
    }
  }

  function getFunctionReturnType(): String {
    if (_operand.FunctionName != null)
      return "(" + displaykey.Web.Rating.Flow.CalcRoutine.FunctionPopup.Returns + ": "
        + getReturnTypeRelativeName() + ")"
    else
      return ""
  }

  function getReturnTypeRelativeName() : String {
    return RateFlowReflection.getMethodInfoForMethod(_lineCode, _operand.FunctionName).ReturnType.RelativeName
  }

  function getReturnType() : String {
    return RateFlowReflection.getMethodInfoForMethod(_lineCode, _operand.FunctionName).ReturnType.Name
  }

  function getFunctionUsage() : String {
    return gw.pcf.rating.flow.RateRoutineUsageHelper.getValueDelegateUsage(_operand)
  }

  function getParamType(rateRoutineParam : CalcStepDefinitionArgument ) : String {
    return RateFlowReflection.getFunctionParameterType(_lineCode, rateRoutineParam.Operand.FunctionName, rateRoutineParam.Parameter).Name
  }

  function getParamTypeRelativeName(rateRoutineParam : CalcStepDefinitionArgument ) : String {
    return RateFlowReflection.getFunctionParameterType(_lineCode, rateRoutineParam.Operand.FunctionName, rateRoutineParam.Parameter).RelativeName
  }

  static function getFunctionNames(lineCode : String, targetDataTypes : List<IType> ) : List<String> {
    return RateFlowReflection.getAvailableFunctions(lineCode, targetDataTypes.toSet()).map(\ i -> i.Name)
  }

  function getFunctionNames(targetDataTypes : Set<IType> ) : List<String> {
    return RateFlowReflection.getAvailableFunctions(_lineCode, targetDataTypes).map(\ i -> i.Name)
  }

  function formatFunctionName( functionName : String ) : String {

    var methodInfo = RateFlowReflection.getMethodInfoForMethod(_lineCode, functionName)

    // someFunction( param1, param2 )
    var formatted = methodInfo.DisplayName + "( " + methodInfo.Parameters.map(\ p -> p.Name ).join(", ") + " )"

    return formatted
  }

  static function sourceValueEditable(rateRoutineParam : entity.CalcStepDefinitionArgument) : boolean {

    var paramTypes = rateRoutineParam.PossibleTypes
    if (paramTypes.Empty) {
      return false
    }

    // check the paramTypes not empty because when we can't get any possible types from param, we may allow freeform
    if (!paramTypes.Empty and
        (not paramTypes.hasMatch(\ paramType -> gw.rating.flow.util.TypeMaps.isAssignableByConstant(paramType)))) {
      return false
    }

    // At least one of the types in paramTypes is assignable from a constant.
    // Now we need to look at this PARTICULAR entity, and return true IFF free-form editing of it is allowed:
    //          must be a new value?                  value was already set, but is untyped
    return rateRoutineParam.OperandType == null or
           rateRoutineParam.IsEditableConstant and (rateRoutineParam.Operand.OperandType == TC_RATEFUNC or rateRoutineParam.AvailableStringValues.Empty)
  }

  function commitFunctionChanges() {
    if (_operand.ArgumentSources.hasMatch(\ arg -> not arg.OverrideSource)) {
      throw new gw.api.util.DisplayableException(displaykey.Web.Rating.Errors.MustDefineAllFunctionArguments)
    }
    _operand.TypeDeclaration = getReturnType()
    _popUp.commit()
  }
}
