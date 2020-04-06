package gw.lob.cp.rating
uses gw.plugin.rateflow.IRateRoutineConfig
uses gw.plugin.rateflow.ICostDataWrapper
uses java.math.RoundingMode
uses java.lang.Integer
uses gw.plugin.rateflow.CostDataBase
uses gw.lang.reflect.IType
uses gw.rating.flow.domain.CalcRoutineCostDataWithTermOverride
uses gw.rating.CostDataWithOverrideSupport
uses gw.rating.flow.domain.CalcRoutineCostDataWithAmountOverride
uses gw.lang.reflect.IPropertyInfo

@Export
class CPRateRoutineConfig implements IRateRoutineConfig {

  // no-args constructor required
  construct() { }

  override function getCostDataWrapperType(paramSet : CalcRoutineParameterSet) : IType {
     return CalcRoutineCostDataWithTermOverride
  }

  override function makeCostDataWrapper(
          paramSet : CalcRoutineParameterSet, 
          costData : CostDataBase, 
          defaultRoundingLevel : Integer, 
          defaultRoundingMode : RoundingMode) : ICostDataWrapper {  

    return new CalcRoutineCostDataWithTermOverride(costData as CostDataWithOverrideSupport, 
            CalcRoutineCostDataWithAmountOverride.OverrideMode.APPROXIMATE_STANDARD_RATES,
            defaultRoundingLevel,
            defaultRoundingMode)
  }

  override function worksheetsEnabledForLine(p0: String): boolean {
    return true
  }

  override function includeProperty(policyLinePatternCode: String, prop: IPropertyInfo): Boolean {
    return null
  }
}
