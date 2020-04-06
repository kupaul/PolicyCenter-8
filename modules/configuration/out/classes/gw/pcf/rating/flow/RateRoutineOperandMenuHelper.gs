package gw.pcf.rating.flow

uses java.util.Date
uses gw.lang.reflect.IType
uses gw.entity.TypeKey
uses gw.rating.flow.util.TypeMaps
uses pcf.RateRoutineTypekeyConstantPopup
uses gw.lang.reflect.TypeSystem
uses java.util.Set
uses java.math.BigDecimal

@Export
class RateRoutineOperandMenuHelper {

  static function showPullRight(operand : CalcStepDefinitionOperand, targetType: IType) : boolean {
    if (operand.isSubOperand) {
      //is this a first or a second sub-operand
      if (operand.isRightSubOperand) {
        var leftOperand = operand.MatchingLeftSubOperand
        if (targetType == Date and leftOperand.IsEditableConstant) {
          // we always disallow comparison between Date Constant and untyped Constant
          return false
        }
        return leftOperand.isComparableInsideConditional(targetType)
      }
      //either it is a left operand, or it is a right operand with something that returns a compatible value
      return true
    } else { // called as part of the main rate routine edit
      if (operand.CalcStep.StepType.hasCategory(CalcStepCategory.TC_FLOWCONTROL)) {
        return false
      } else if (operand.CalcStep.StepType.hasCategory(CalcStepCategory.TC_CONTINUE) and
                 operand.OperatorType.hasCategory(CalcStepOperatorCategory.TC_MATHEMATICAL)) {
        return TypeMaps.isAssignable(targetType, BigDecimal)
      } else if (operand.CalcStep.StepType == TC_ASSIGNMENT) {
        if (operand.CalcStep.StoreType.HasContent) {
          return TypeMaps.isAssignable(targetType, TypeSystem.getByRelativeName(operand.CalcStep.StoreType))
        }
        // Unknown store type, all types okay
        return true
      } else {
        return false
      }
    }
  }

  static function showTypelistPullRight(targetTypes : Set<IType>) : boolean {
    if (targetTypes.Count == 0) {
      return true
    } else if (targetTypes.Count > 1) {
      return false
    } 
    return TypeKey.Type.isAssignableFrom(targetTypes.single())    
  }

  static function showDateConstantPullRight(operand : CalcStepDefinitionOperand): boolean {
     return showPullRight(operand, Date)
  }

  /**
   * Produce value for "available" on Conditional Popup:Right Operand:Menu Item Set:Constant
   * and Rate Routine Edit Screen:Operand:Menu Item Set:Constant
   */
  static function showConstantPullRight(operand : CalcStepDefinitionOperand): boolean {
    if (operand.IsEditableConstant) {
      // Always allowed to compare two untyped constants, so you would think this should return true.
      // But the behavior we want when the right-hand side has the untyped constant field showing
      // is for the Constant menu item to be checked AND grayed out.  So return false for "available."
      return false
    }

    // We do comparability checks on right hand side of conditional vs left hand side,
    // but in all other cases, an untyped constant can be compared to anything.
    if (operand.isRightSubOperand) {
      var leftOperand = operand.MatchingLeftSubOperand
      return leftOperand.isComparableToConstantInsideConditional()
    } else {
      return true
    }
  }

  static function showCostDataPullRight(operand : CalcStepDefinitionOperand) : boolean {
   if (operand.isSubOperand) {
      //is this a first or a second sub-operand
      if (operand.isRightSubOperand) {
        var leftOperand = operand.MatchingLeftSubOperand
        if (not leftOperand.isComparableInsideConditional(java.math.BigDecimal)) {
          return false
        }
      }
      //either it is a left operand, or it is a right operand with something that returns a compatible value
      return true
    } else { // called as part of the main rate routine edit
        return (not operand.CalcStep.StepType.hasCategory(CalcStepCategory.TC_FLOWCONTROL))
    }
  }

  static function showConditionalPullRight(operand : CalcStepDefinitionOperand): boolean {
    if (operand.CalcStep.StepType == TC_ASSIGNMENT ) {
      if (operand.CalcStep.InScopeParam == TC_CostData) {
        return false // can't assign boolean to BigDecimal
      }
      return true // CAN assign boolean to a local variable
    } else if (operand.CalcStep.StepType.hasCategory(CalcStepCategory.TC_FLOWCONTROL)) {
        return not operand.CalcStep.StepType.hasCategory(CalcStepCategory.TC_NOOPERAND)
    } else {
      // step type is probably "continue" i.e. steps that use a math operator
      return false
    }
  }

  static function pushRateRoutineTypekeyConstantPopup(operand : CalcStepDefinitionOperand, targetTypes : Set<IType>) : pcf.api.Location {
    if (targetTypes == null or targetTypes.Empty) {
      return RateRoutineTypekeyConstantPopup.push(operand)
    }
    var targetType = targetTypes.single()
    var matchingLeftOperand = operand.MatchingLeftSubOperand
    if (matchingLeftOperand.IsTypeKey) { // Sub operand
      return RateRoutineTypekeyConstantPopup.push(operand, matchingLeftOperand.TypeDeclaration)
    } else { // Primary operand
      return RateRoutineTypekeyConstantPopup.push(operand, targetType.Name)
    } 
  }

}
