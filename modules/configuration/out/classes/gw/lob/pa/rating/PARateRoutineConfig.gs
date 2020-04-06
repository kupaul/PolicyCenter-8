package gw.lob.pa.rating
uses gw.plugin.rateflow.IRateRoutineConfig
uses java.math.RoundingMode
uses java.lang.Integer
uses gw.plugin.rateflow.CostDataBase
uses gw.lang.reflect.IType
uses gw.plugin.rateflow.ICostDataWrapper
uses gw.rating.flow.domain.CalcRoutineCostDataWithPremiumCap
uses gw.rating.flow.domain.CalcRoutineCostData
uses java.util.Set
uses gw.rating.CostData
uses gw.lang.reflect.IPropertyInfo

@Export
class PARateRoutineConfig implements IRateRoutineConfig {

  // no-args constructor required
  construct() { }

  override function getCostDataWrapperType(paramSet : CalcRoutineParameterSet) : IType {
    if (!paramSetAssociatedWithCostData(paramSet)) {
      return null
    } else if (paramSet.Parameters?.hasMatch(\ param -> param.Code == TC_PREVIOUSTERMAMOUNT)) {
      return CalcRoutineCostDataWithPremiumCap
    } else {
      return CalcRoutineCostData
    }
  }

  override function makeCostDataWrapper(
          paramSet : CalcRoutineParameterSet, 
          costData : CostDataBase, 
          defaultRoundingLevel : Integer, 
          defaultRoundingMode : RoundingMode) : ICostDataWrapper {  

    if (paramSet.Parameters?.hasMatch(\ param -> param.Code == TC_PREVIOUSTERMAMOUNT)) {
      return new CalcRoutineCostDataWithPremiumCap(costData as CostData, defaultRoundingLevel, defaultRoundingMode)
    } else {
      return new CalcRoutineCostData(costData as CostData, defaultRoundingLevel, defaultRoundingMode)                               
    }
  }

  override function worksheetsEnabledForLine(p0 : String) : boolean {
    return true
  }

  // Set of parameter codes for parameter sets which should not require cost data
  var noCostDataParamSets : Set<String> = {"PADriverAssignmentParamSet"}
  private function paramSetAssociatedWithCostData(paramSet: CalcRoutineParameterSet): boolean {
    if (noCostDataParamSets.contains(paramSet.Code)) {
      return false
    } else {
      return true
    }
  }

  override function includeProperty(policyLinePatternCode: String, prop: IPropertyInfo): Boolean {
    return null
  }
}
