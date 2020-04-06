package gw.pcf.rating.flow
uses java.util.LinkedHashMap
uses java.util.Map
uses java.util.Set
uses gw.lang.reflect.IType

@Export
class RateRoutineParamPopupHelper {

  private var _tabCodeNameMap: Map<String,String>
  private var _allPreviousVariableNames : java.util.List<java.lang.String>

  static var rejectedElements = {typekey.CalcRoutineParamName.TC_RATEDATE, typekey.CalcRoutineParamName.TC_COVERAGE }
  static function filterInScopeParamDropDownRange(step : CalcStepDefinition, valueToFilter : typekey.CalcRoutineParamName) : boolean {
    return step.CalcRoutineDefinition.ParameterSet.Parameters.map(\ param -> param.Code ).toSet().contains(valueToFilter)
            and !(rejectedElements.contains(valueToFilter))
  }

  private var _step: CalcStepDefinition

  construct(step: CalcStepDefinition) {
    _step = step
  }

  function parseRateTables() : Map<String,String> {
    if (_tabCodeNameMap != null) {
      return _tabCodeNameMap
    }
    _tabCodeNameMap = new LinkedHashMap<String,String>()
    var rTables = _step.CalcRoutineDefinition.availableTables()
    if (rTables.Count > 0) {
      rTables.each(\rt -> _tabCodeNameMap.put(rt.TableCode, rt.TableName))
    }
    return _tabCodeNameMap
  }

  function getAllPreviousVariableName() : List<String> {
    if (_allPreviousVariableNames != null) {
      return _allPreviousVariableNames
    }

    _allPreviousVariableNames = _step.CalcRoutineDefinition.Steps.where(\ aStep -> aStep != _step)
                 .map(\ s -> s.StoreLocation)
                 .where(\ s -> s != null)
                 .toSet()
                 .toList()
    return _allPreviousVariableNames
  }

  static function getParamType(arg : CalcStepDefinitionArgument) : String {
    var valProvider = arg.FirstMatchingRateTableColumn.ValueProvider
    if (valProvider == null) {
      return arg.ColumnDataType.toString()
    }
    return "List"
  }

  // Show the menu if the possible argument parameter types contains s particular TypeList
  // or is explicitly stated to be some type of TypeKey
  static function showTypeListMenu(argParamTypes : Set<IType>) : boolean {
    return argParamTypes.hasMatch(\argParamType ->argParamType typeis gw.entity.ITypeList) // has TypeList
           or argParamTypes.hasMatch(\argParamType ->argParamType == gw.entity.TypeKey)
  }

}
