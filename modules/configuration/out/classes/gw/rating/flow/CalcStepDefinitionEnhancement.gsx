package gw.rating.flow

uses gw.lang.reflect.IType
uses java.lang.Character
uses java.lang.IllegalArgumentException
uses java.lang.String
uses java.util.HashSet
uses gw.api.rating.flow.VariableUtil

enhancement CalcStepDefinitionEnhancement : entity.CalcStepDefinition {

  static property get MultiFactorType() : Type {
    return MultiFactorVariable.Type
  }

  property get StoreLocationForDisplay() : String {
    if (this.InScopeParam != null) {
      if (this.InScopeParam == CalcRoutineParamName.TC_COSTDATA) {
         // This contains the Cost Data field
        return displaykey.Web.Rating.Flow.CalcRoutine.CostDataStoreLabel(this.InScopeParam.DisplayName, this.InScopeValue)
      } else {
        return (displaykey.Web.Rating.Flow.CalcRoutine.WritableParamStoreTarget(this.InScopeParam.DisplayName, this.InScopeValue))
      }
    } else {
      return this.StoreLocation
    }
  }

  property get ArgumentSources() : CalcStepDefinitionArgument[] {
    return PrimaryOperand.ArgumentSources
  }

  property get PrimaryOperand() : CalcStepDefinitionOperand {
    return this.Operands.singleWhere(\ c -> c.OperandOrder == 0)
  }

  property get OrderedOperands() : CalcStepDefinitionOperand[] {
    return this.Operands.orderBy(\ op -> op.OperandOrder).toTypedArray()
  }

  function setStepTypeFromOperatorType(operatorType : CalcStepOperatorType) {
    this.StepType = getStepTypeFromOperatorType(operatorType)
  }

  static final function getStepTypeFromOperatorType(operatorType : CalcStepOperatorType) : CalcStepType{
    if (operatorType == null) {
      // Use assignment step in cases where operatorType is set to NULL
      // to be consistent with how new steps are handled.
      return TC_ASSIGNMENT
    } else {
      var opCategoryType = operatorType.Categories.first()
      switch(opCategoryType) {
        case CalcStepOperatorCategory.TC_ASSIGNMENT:
          return CalcStepType.TC_ASSIGNMENT
        case CalcStepOperatorCategory.TC_MATHEMATICAL:
        case CalcStepOperatorCategory.TC_GROUPING:
        case CalcStepOperatorCategory.TC_ROUNDING:
          return TC_CONTINUE
        default:
          throw new java.lang.IllegalStateException("Unknown CalcStep Operator Type ${operatorType}")
      }
    }
  }

  function validateVariableName(costDataUsages : java.util.List<gw.rating.flow.util.InScopeUsage>) : String {
    if (this.StepType == TC_ASSIGNMENT) {
      var value = this.StoreLocation
      if (value == null or value.Empty) {
        return displaykey.Validation.Rating.RateRoutineDefinition.LocalVariable.NonEmpty
      }
      if (not Character.isLetter(value.charAt(0))) {
        return displaykey.Validation.Rating.RateRoutineDefinition.LocalVariable.BeginWithLetter
      }
      if (not VariableUtil.isValidIdentifierName(value)) {
        return displaykey.Validation.Rating.RateRoutineDefinition.LocalVariable.InvalidCharacters
      }
      if (gw.lang.parser.Keyword.isKeyword(value)) {
        return displaykey.Validation.Rating.RateRoutineDefinition.LocalVariable.ReservedKeyword(value)
      }      
      // Menu displays the Path for CostData, NOT the DisplayName!!
      if (costDataUsages.hasMatch(\ c -> c.Path.compareToIgnoreCase(value) == 0)) { 
        return displaykey.Validation.Rating.RateRoutineDefinition.LocalVariable.CostData(value)
      }
      return validateVariableNameAgainstParamSet()
    }
    return null
  }
  
  function validateVariableNameAgainstParamSet() : String {
    var paramSet = this.CalcRoutineDefinition.ParameterSet
    if (paramSet != null and paramSet.Parameters.hasMatch(\ p -> p.Code.DisplayName.compareToIgnoreCase(this.StoreLocation) == 0)) {
      return displaykey.Validation.Rating.RateRoutineDefinition.LocalVariable.ParameterInParamSet(this.StoreLocation)
    }
    return null
  }

  function removeOperands() {
    this.Operands.where(\op -> op.OperandOrder > 0).each(\op -> op.remove())
  }

  function getAllExistingVariableNames(includeComplexVars : boolean) : List<LocalVariable> {
    
    var localVarList : List<LocalVariable> = {}
    
    var targetVarSteps = this.CalcRoutineDefinition.FilteredOrderedSteps
                           (\step ->step != this and
                                          step.StoreLocation != null)
                                           
    var varsSoFar = new HashSet<String>()
    
    targetVarSteps.each(\storeStep -> {
      var varName = storeStep.StoreLocation
      var operandType = storeStep.PrimaryOperand.OperandIType
      if (not varsSoFar.contains(varName)) {
        localVarList.add(new LocalVariable(varName, null, varName, operandType))
        varsSoFar.add(varName)
      } else {
        // might need to make sure it's a compatible type?
      }
      
      if (includeComplexVars and operandType == MultiFactorVariable) {
        var rateTable = storeStep.PrimaryOperand.RateTableDefinition
        var factors = rateTable.Factors
        factors.each(\f -> {
          var columnType = rateTable.getFactorIType(f.ColumnName)
          var label = displaykey.Web.Rating.Flow.CalcRoutine.LocalVarLabel(varName,
                            displaykey.Web.Rating.Flow.CalcRoutine.LocalVarFieldLabel(f.ColumnLabel))
          localVarList.add(new LocalVariable(varName, f.ColumnName, label, columnType))
        })
      }
    })
    return localVarList
  }

  property get StepMode() : String {
    switch(this.StepType){
       case TC_IF:
       case TC_ELSEIF:
       case TC_ELSE:
       case TC_ENDIF:
           return "flowcontrol"
       case TC_ASSIGNMENT:
           return "assignment"
       default:
           return "default"
    }
  }

  property get IsTermAmountAssignment() : boolean {
   return (this.StepType == TC_ASSIGNMENT and 
           this.InScopeParam == CalcRoutineParamName.TC_COSTDATA and
           this.InScopeValue == "TermAmount")
  }

  property get IsBlankStep() : boolean {
    return this.StepType == TC_ASSIGNMENT and 
            this.PrimaryOperand.OperatorType == null and 
            this.StoreLocationForDisplay == null and
            this.PrimaryOperand.LeftParenthesisGroup == null and
            this.PrimaryOperand.RightParenthesisGroup == null and
            this.PrimaryOperand.OperandType == TC_CONSTANT and
            this.PrimaryOperand.ConstantValue == null
  }
  
  property get IsSectionCommentStep() : boolean {
    return this.StepType == TC_COMMENT
  }

  function setAssignmentValuesForInScopeTarget(param : CalcRoutineParamName, targetPath : String, targetType : IType) {
    this.InScopeParam = param
    this.InScopeValue = targetPath
    this.StepType = TC_ASSIGNMENT
    this.StoreType = targetType.Name
    this.StoreLocation = null // Reset the local variable name
  }

  function setStepToAssignmentNewVariable() {
    clearInstructionStorage()
    this.StepType = TC_ASSIGNMENT
    if (this.Operands.Count > 0) {
      this.PrimaryOperand.OperatorType = TC_STORE
    }
  }

  function setStepToAssignmentVariable(varName : String) {
    this.StepType = CalcStepType.TC_ASSIGNMENT
    this.StoreLocation = varName
    this.InScopeParam = null
    this.InScopeValue = null
  }

  function setStepToSectionComment() {
    resetStepAndSetDefaultOperatorType()
    this.StepType = CalcStepType.TC_COMMENT
  }

  function resetStepAndSetDefaultOperatorType() {
    this.StepType = TC_ASSIGNMENT
    clearInstructionStorage()
    if (this.Operands.Count > 0) {
      this.PrimaryOperand.OperatorType = TC_STORE
    }
  }

  function changeToFlowControlStepType(newStepType : CalcStepType) {
    if (!newStepType.hasCategory(CalcStepCategory.TC_FLOWCONTROL)) {
      throw new IllegalArgumentException("newStepType (" + newStepType + ") is not a flow control step")
    }
    if (newStepType != this.StepType) {
      this.StepType = newStepType
    }
    this.PrimaryOperand.LeftParenthesisGroup = null
    this.PrimaryOperand.RightParenthesisGroup = null
  }

  function clearInstructionStorage() {
    this.InScopeParam = null
    this.InScopeValue = null
    this.StoreLocation = null
  }

  function clearUnusedInstruction() {
    if (not this.StepType.hasCategory(CalcStepCategory.TC_ASSIGNMENT)) {
      clearInstructionStorage()
    }
  }
}
