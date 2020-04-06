package gw.pcf.rating.flow

uses gw.lang.reflect.IType
uses gw.lang.reflect.TypeSystem
uses gw.rating.flow.LocalVariable
uses gw.rating.flow.util.InScopeUsage
uses gw.rating.flow.util.TypeMaps
uses java.util.Collections
uses java.util.Map
uses java.util.Set
uses gw.entity.TypeKey
uses java.lang.Integer
uses java.math.BigDecimal
uses gw.api.productmodel.ProductModelTypeHelper

@Export
class RateRoutinePullRightMenuHelper {

  static var rejectedElements = {typekey.CalcRoutineParamName.TC_RATEDATE}

  static function filteredParamSet(parameterSet : CalcRoutineParameterSet) : List<CalcRoutineParameter> {
    if (null == parameterSet) return {}

    // add to the "reject" set any Coverage for which we don't know the Pattern Code
    // do it by building up the list, so we can support parameter sets with multiple Coverages.
    var untypedCoverages = parameterSet.Parameters
          .where(\ p -> p.isCoverageParam and p.CoveragePattern == null)
          .map(\ p -> p.Code).toSet()
    var reject = rejectedElements.union(untypedCoverages)

    return parameterSet.Parameters.where(\param -> !reject.contains(param.Code)).toSet().toList()
  }

  static function filterInScopeParam(parameterSet : CalcRoutineParameterSet, valueToFilter : typekey.CalcRoutineParamName) : boolean {
    return filteredParamSet(parameterSet).map(\param -> param.Code).contains(valueToFilter)
  }

  static function numFields(inScopeParameter : CalcRoutineParameter,
                            paramInScopeUsageMap : Map<CalcRoutineParamName,List<InScopeUsage>>,
                            targetTypes : Set<IType>, forComparison: CompareOrAssign) : int {
    return getInScopeFields(inScopeParameter, paramInScopeUsageMap, targetTypes, forComparison).Count
  }

  static function showEntityPopupMenu(inScopeParameter : CalcRoutineParameter,
                                      paramInScopeUsageMap : Map<CalcRoutineParamName,List<InScopeUsage>>,
                                      targetTypes : Set<IType>,
                                      forComparison: CompareOrAssign) : boolean {
    var numInScopeUsages = numFields(inScopeParameter, paramInScopeUsageMap, targetTypes, forComparison)
    return (numInScopeUsages > PopUpThreshold)
  }

  static function showEntityPullRightMenu(inScopeParameter : CalcRoutineParameter,
                                         paramInScopeUsageMap : Map<CalcRoutineParamName,List<InScopeUsage>>,
                                         targetTypes : Set<IType>,
                                         forComparison: CompareOrAssign) : boolean {

    var numInScopeUsages = numFields(inScopeParameter, paramInScopeUsageMap, targetTypes, forComparison)
    return (numInScopeUsages > 0) and (numInScopeUsages <= PopUpThreshold)
  }

  static function showConstantPopupMenu(arg : entity.CalcStepDefinitionArgument) : boolean {
    var count = arg.AvailableStringValues.Count
    return count > PopUpThreshold

  }

  static function showConstantPullrightMenu(arg : entity.CalcStepDefinitionArgument) : boolean {
    var count = arg.AvailableStringValues.Count
    return count > 0 and count < PopUpThreshold
  }

  static function showTypelistPullrightMenu(arg : entity.CalcStepDefinitionArgument) : boolean {
    var count = arg.AvailableTypeListValues.Count
    return count > 0 and count < PopUpThreshold
  }

  static function showTypelistPopupMenu(arg : entity.CalcStepDefinitionArgument) : boolean {
    var count = arg.AvailableTypeListValues.Count
    return count > PopUpThreshold or count <= 0 // show this one if there is no typelist; it will be grayed out.
  }

  static function getSortedInScopeFields(inScopeParameter : CalcRoutineParameter,
                                   paramInScopeUsageMap : Map<CalcRoutineParamName,List<InScopeUsage>>,
                                   targetTypes : Set<IType>, forComparison: CompareOrAssign) : List<InScopeUsage> {
    if(paramInScopeUsageMap.containsKey(inScopeParameter.Code)){
      return sortInScopeFields(getInScopeFields(inScopeParameter, paramInScopeUsageMap, targetTypes, forComparison))
    }
    return Collections.emptyList<InScopeUsage>()
  }

  static function getInScopeFields(inScopeParameter : CalcRoutineParameter,
                                   paramInScopeUsageMap : Map<CalcRoutineParamName,List<InScopeUsage>>,
                                   targetTypes : Set<IType>,
                                   forComparison: CompareOrAssign) : List<InScopeUsage> {
    if (paramInScopeUsageMap.containsKey(inScopeParameter.Code)) {
      var allInScopeUsages : List<InScopeUsage> = {}
      allInScopeUsages = paramInScopeUsageMap.get(inScopeParameter.Code)
      if (targetTypes.Count > 0) {
        switch (forComparison) {
          case (CompareOrAssign.ASSIGN)  : return allInScopeUsages.where(\u -> TypeMaps.isAssignable(targetTypes, u.FeatureType))
          case (CompareOrAssign.COMPARE) : return allInScopeUsages.where(\u -> TypeMaps.isComparable(targetTypes, u.FeatureType))
        }
      } else {
        return allInScopeUsages
      }
    }
    return Collections.emptyList<InScopeUsage>()
  }

  static function sortInScopeFields(inScopeUsages : List<InScopeUsage>) : List<InScopeUsage> {
    //we're not just doing a sortby using getInScopeParamMenuLabel because it is very costly,
    //and therefore we don't want to call it for the log-n comparison multiplier
    //this way, it gets called only once per InScopeUsage
    //I also don't use mapToKeyAndValue because there is a lot of overhead for the blocks, and performance is key here
    var labelsToUsages : java.util.Map<java.lang.String, gw.rating.flow.util.InScopeUsage> = {}
    inScopeUsages.each(\ inScopeUsage -> labelsToUsages.put(inScopeUsage.DisplayName, inScopeUsage) )
    var sortedLabels = labelsToUsages.Keys.toList().sort()
    var resultList : List<InScopeUsage> = {}
    sortedLabels.each(\ label -> resultList.add(labelsToUsages.get(label)))
    return resultList
  }

  static function setInScopeOperand(value : CalcStepValueDelegate, paramName : CalcRoutineParamName, usage : InScopeUsage) {
    if (value typeis CalcStepDefinitionArgument) {
      value.OverrideSource = true
    }
    value.OperandType = TC_INSCOPE
    value.InScopeParam = paramName
    value.InScopeValue = usage.Path
    value.InScopeValueType = ProductModelTypeHelper.getEntityType(usage.FeatureType).Name
    value.InScopeValueIsModifier = usage.IsModifier
    value.CovTermCode = usage.CovTermPattern.Code
  }

  /**
   * Return the set of targeted data types for a given operand by looking at the associated step.
   *
   * @return list of ITypes associated with the store target
   */
  static function getTargetDataTypes(operand : CalcStepDefinitionOperand) : Set<IType> {
    if (operand.PrimaryOperand) {
      if (operand.OperatorType != null and operand.OperatorType.hasCategory(CalcStepOperatorCategory.TC_MATHEMATICAL)) {
        return {BigDecimal, Integer}
      }
      switch (operand.CalcStep.StepType) {
        case TC_ASSIGNMENT:
          if ((operand.CalcStep.InScopeParam != null) and operand.CalcStep.StoreType != null) {
            return {TypeSystem.getByRelativeName(operand.CalcStep.StoreType)}
          }
          break
        case TC_IF:
        case TC_ELSEIF:
          return {Boolean}
      }
    } else if (operand.isRightSubOperand) {
      var leftOpType = operand.MatchingLeftSubOperand.OperandIType
      if (leftOpType != null) {
        return {leftOpType}
      }
    }
    return null
  }

  static property get PopUpThreshold() : int {
    return 25
  }

  static function setLocalVar(operand : CalcStepDefinitionOperand, localVar : LocalVariable) {
    operand.changeToOperandType( TC_LOCALVAR )
    operand.VariableName = localVar.VariableName
    operand.VariableFieldName = localVar.FieldName
  }

  static function filterAndSortLocalVars(storeTargetTypes : Set<IType>,
                                         availLocalVariables : List<LocalVariable>) : List<LocalVariable> {
    if (storeTargetTypes.Count == 0) {
      return availLocalVariables.sortBy(\localVar -> localVar.Label)
    } else {
      var filteredList =
            availLocalVariables.where(\localVar ->(localVar.VarType == null)
                                      or (TypeMaps.isAssignable(storeTargetTypes, localVar.VarType)))
                               .sortBy(\localVar -> localVar.Label)
      return filteredList
    }
  }

  static function setCostData(arg : CalcStepDefinitionArgument, costDataItem : InScopeUsage) {
    arg.OverrideSource = true
    arg.changeToOperandType(TC_INSCOPE)
    arg.InScopeParam = TC_COSTDATA
    arg.InScopeValue = costDataItem.Path
    arg.InScopeValueIsModifier = false
    arg.InScopeValueType = costDataItem.FeatureType as String
    arg.clearDependentValues()
  }

  static function setLocalVar(arg : CalcStepDefinitionArgument, localVar : LocalVariable) {
    arg.OverrideSource = true
    arg.changeToOperandType(TC_LOCALVAR)
    arg.VariableName = localVar.VariableName
    arg.VariableFieldName = localVar.FieldName
    arg.clearDependentValues()
  }

  static function resetConstant(arg : CalcStepDefinitionArgument) {
    arg.OverrideSource = true
    arg.changeToOperandType(TC_CONSTANT)
    arg.maybeClearConstantSubtypeValue(null)
    arg.clearDependentValues()
  }

  static function setConstant(arg : CalcStepDefinitionArgument, constantValue : String) {
    arg.OverrideSource = true
    arg.changeToOperandType(TC_CONSTANT)
    arg.ConstantValue = arg.ParameterTypeIsBoolean ? constantValue : "\"${constantValue}\""
    arg.clearDependentValues()
  }

  static function setTypeKeyConstant(arg : CalcStepDefinitionArgument, typekey : gw.entity.TypeKey) {
    arg.OverrideSource = true
    arg.changeToOperandType(TC_CONSTANT)
    arg.TypekeyConstantValue = typekey
    arg.clearDependentValues()
  }

  static function clear(arg : CalcStepDefinitionArgument) {
    arg.clear()
    arg.clearDependentValues()
  }

  static function getAllExistingVariableNamesForInstruction(step : CalcStepDefinition) : List<gw.rating.flow.LocalVariable> {
    return step.getAllExistingVariableNames(false).orderBy(\localVar -> localVar.Label)
  }

  static function getAllExistingVariableNamesForOperand(step : CalcStepDefinition) : List<gw.rating.flow.LocalVariable> {
    return step.getAllExistingVariableNames(true)
  }
}
