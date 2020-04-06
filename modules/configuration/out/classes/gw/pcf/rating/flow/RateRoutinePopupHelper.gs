package gw.pcf.rating.flow

uses java.util.Set
uses java.math.BigDecimal
uses java.util.regex.Pattern
uses java.lang.NumberFormatException
uses gw.rating.rtm.valueprovider.AbstractProductModelValueProvider
uses java.lang.IllegalStateException
uses java.util.Date

@Export
class RateRoutinePopupHelper {

  static function afterEnterTypeKeyConstantPopup(valueDelegate : CalcStepValueDelegate, preSelectedTypeKey : String ) {
    maybeSetOverrideSource(valueDelegate)
    valueDelegate.changeToOperandType(TC_CONSTANT)
    valueDelegate.maybeClearConstantSubtypeValue((preSelectedTypeKey != null) ? preSelectedTypeKey : valueDelegate.TYPELIST_SUBTYPE)
  }

  static function afterEnterDateConstantPopup(valueDelegate : CalcStepValueDelegate) {
    maybeSetOverrideSource(valueDelegate)
    valueDelegate.changeToOperandType(TC_CONSTANT)
    valueDelegate.maybeClearConstantSubtypeValue("java.util.Date")
  }

  static function afterEnterEntityPopup(valueDelegate : CalcStepValueDelegate,
                                        selectedEntity : CalcRoutineParamName,
                                        inScopeUsages : List<gw.rating.flow.util.InScopeUsage>,
                                        helper : RateRoutineEntityPopupHelper ) {
    maybeSetOverrideSource(valueDelegate)
    valueDelegate.changeToOperandType(TC_INSCOPE)
    if (selectedEntity != null) {
      inScopeUsages.clear()
      inScopeUsages.addAll(helper.changeSelectEntityTo(selectedEntity))
    }
  }

  static function variableValidationExpression(step : CalcStepDefinition,
                  costDataUsages : java.util.List<gw.rating.flow.util.InScopeUsage>) : String {
    var availLocalVariables = step.getAllExistingVariableNames(false).map(\localVar -> localVar.VariableName)
    if (availLocalVariables.contains(step.StoreLocation)) {
      return displaykey.Validation.Rating.RateRoutineDefinition.LocalVariable.ExistingName
    } else {
      return step.validateVariableName(costDataUsages)
    }
  }

  static private function valueIsNull(valueCandidate : String): boolean {
    return not valueCandidate.HasContent or valueCandidate.equalsIgnoreCase("null")
           or not AbstractProductModelValueProvider.removeQuotes({valueCandidate}).single().HasContent
  }

  static private function checkComparedToNull(otherOperand : CalcStepDefinitionOperand) : String {
    var targetOpType = otherOperand.conditionOperatorType
    if ((targetOpType != null) and constantComparison(otherOperand, targetOpType)) {
      return displaykey.Validation.Rating.CompareNullWithConstant
    }
    return null
  }

  static private function constantComparison(operand : CalcStepDefinitionOperand, opType : CalcStepOperatorType) : boolean {
    return (operand.OperandType == TC_CONSTANT or
            !{CalcStepOperatorType.TC_EQUAL, CalcStepOperatorType.TC_NOTEQUAL}.contains(opType))
  }

  static function untypedConstantValidationExpression(op: CalcStepValueDelegate) : String {
    return untypedConstantValidationExpression(null, op)
  }
  
  static function untypedConstantValidationExpression(otherOperand : CalcStepDefinitionOperand, op: CalcStepValueDelegate) : String {
    if (op == null) {
      throw new IllegalStateException("Attempt to validate constant operand but the operand is null")
    }
    var typeOfConstant = op.TypeOfConstant
    switch (typeOfConstant) {
      case null:
        if(otherOperand != null) {
          return checkComparedToNull(otherOperand)  
        } else {
          //else the other operand argument was null, this is null, all okay!
          return null
        }
      case String:
        return stringConstantValidationExpression(op.ConstantValue)
      case gw.entity.TypeKey:
      case Date:
      case Boolean:
      case Number:
        return null
      default:
        throw new IllegalStateException("Unsupported constant type")
    }
  }
  
  private static function stringConstantValidationExpression(valueCandidate: String) : String {
    if (valueCandidate.contains('"' as java.lang.CharSequence)) {
      // Make sure if there's a quote, that it starts and ends with "
      if (valueCandidate.startsWith("\"") and valueCandidate.endsWith("\"")) {
        // Remove first and last double quotes
        var tempString = valueCandidate.substring(1,valueCandidate.length-1)
        // Regex will make sure any embedded quotes are escaped
        var stringCheckRegexPattern = Pattern.compile("(\\\\.|[^\"])*+")
        var matcher = stringCheckRegexPattern.matcher(tempString)
        if (matcher.matches()) {
          return null
        } else {
          return displaykey.Validation.Rating.UnescapedQuotes
        }
      } 
    }  
    return displaykey.Validation.Rating.UntypedConstantValue
  }

  private static function maybeSetOverrideSource(valueDelegate : CalcStepValueDelegate) {
    if ((valueDelegate typeis CalcStepDefinitionArgument) and
        (valueDelegate.Operand.OperandType == TC_RATETABLE)) {
      valueDelegate.OverrideSource = true
    }
  }

  private static var validConstantNonStringNonNumericValues : Set<String> =
        {"True","true","False","false","TRUE","FALSE","null","NULL","Null"}

}
