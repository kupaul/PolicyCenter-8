package gw.pcf.rating
uses gw.api.database.Query
uses gw.rating.rtm.util.ProductModelUtils

@Export
class ParameterSetHelper {

  construct() {

  }
  
  function getAllParamSets() : List<CalcRoutineParameterSet> {
    return new Query<CalcRoutineParameterSet>(CalcRoutineParameterSet).select().orderBy(\ c -> c.Name).toList()
  }

  function getParamSets(allParamSets : List<CalcRoutineParameterSet>, polLinePatternCode : String) : List<CalcRoutineParameterSet> {
    return allParamSets.where(\ ps -> ps.PolicyLinePatternCode == polLinePatternCode)
  }

  function getAllLOBsWithParamSets() : String[] {
    var activePolicyPatternCodes = getAllParamSets().map(\ps -> ps.PolicyLinePatternCode)
    return ProductModelUtils.getAllPolicyLines().where(\code -> activePolicyPatternCodes.contains(code)).toList().toTypedArray()
  }

  function getHelpStringForParamTypes(paramSet : CalcRoutineParameterSet) : String {
    var params = paramSet.Parameters
    if (params.Count>0) {
      return params.map(\param -> param.Code.DisplayName + " (" + param.ParamType + ")").join(", ")
    } else {
      return ""
    }
  }

  function getStringForParamTypes(paramSet : CalcRoutineParameterSet) : String {
    var params = paramSet.Parameters
    if (params.Count>0) {
      return params.map(\param -> param.Code.DisplayName).join(", ")
    } else {
      return ""
    }
  }

}
