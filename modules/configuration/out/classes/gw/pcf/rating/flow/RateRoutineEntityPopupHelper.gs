package gw.pcf.rating.flow

uses java.util.Map
uses java.util.LinkedHashMap
uses gw.rating.flow.util.InScopeUsage
uses gw.api.web.PebblesUtil
uses com.guidewire.pl.system.filters.BeanBasedQueryFilter
uses java.util.HashMap
uses gw.lang.reflect.IType
uses gw.rating.flow.util.TypeMaps
uses gw.rating.flow.util.RatingEntityGraphTraverser
uses java.util.Set
uses gw.rating.flow.LocalVariable

@Export
class RateRoutineEntityPopupHelper {

  private var _tabCodeNameMap: Map<String,String>
  private var _allPreviousVariableNames : List<LocalVariable>
  private var _valueDelegate : CalcStepValueDelegate
  private var _step: CalcStepDefinition
  private var _restrictToTargetDataTypes : Set<Type>
  private var _currentLocation : pcf.RateRoutineEntityPopup

  construct(currentLocation : pcf.RateRoutineEntityPopup, valueDelegate : CalcStepValueDelegate, step: CalcStepDefinition, restrictToTargetDataTypes : Set<Type>) {
    _currentLocation = currentLocation
    _step = step
    _valueDelegate = valueDelegate
    _restrictToTargetDataTypes = restrictToTargetDataTypes
  }

  function filterInScopeParamDropDownRange(valueToFilter : typekey.CalcRoutineParamName) : boolean {
    return RateRoutinePullRightMenuHelper.filterInScopeParam(_step.CalcRoutineDefinition.ParameterSet,valueToFilter)
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

  function getAllPreviousVariableName() : List<LocalVariable> {
    if (_allPreviousVariableNames != null) {
      return _allPreviousVariableNames
    }
    _allPreviousVariableNames = _step.getAllExistingVariableNames(false)
    return _allPreviousVariableNames
  }

  function fetchInScopeUsages(limitedToModifier : boolean) : List<InScopeUsage> {
    return fetchInScopeUsages(limitedToModifier, null)
  }

  function fetchInScopeUsages(limitedToModifier : boolean, selectedEntity : CalcRoutineParamName) : List<InScopeUsage> {
    if (selectedEntity != null) {
      _valueDelegate.resetInScope();
      _valueDelegate.InScopeParam = selectedEntity;
    }
    var result = getAllTargetElements()
    if(limitedToModifier){
      result = result.where(\ u -> u.IsModifier == limitedToModifier)
    }
    if (_restrictToTargetDataTypes.Count > 0) {
      return result.where(\ u -> TypeMaps.isAssignable(_restrictToTargetDataTypes, u.FeatureType))
    } else {
      return result
    }
  }

  function noneSelected(): boolean {
    //InScopeValue itself can be null (i.e. when it is the selected entity "(this)") therefore check for InScopeValueType
    return _valueDelegate.InScopeValueType == null
  }

  function changeSelectEntityTo( selectedEntity : CalcRoutineParamName  ) : List<InScopeUsage>{

    _valueDelegate.resetInScope();
    _valueDelegate.InScopeParam = selectedEntity;
    PebblesUtil.invalidateIterators(_currentLocation, InScopeUsage)
    return fetchInScopeUsages(false)

  }

  static function filtersForDataTypes( usages : List<InScopeUsage>, restrictToDataTypes : Set<IType>): BeanBasedQueryFilter[] {
    var result = new HashMap<String, BeanBasedQueryFilter>()
    for (u in usages) {
      if(restrictToDataTypes == null || restrictToDataTypes.hasMatch(\ i -> TypeMaps.isAssignable(i, u.FeatureType))) {       
        var aFilter = new BeanBasedQueryFilter(){
          override function applyFilter( obj : Object ) : boolean {
            var usage = obj as InScopeUsage
            return usage.UserFriendlyDataType == u.UserFriendlyDataType
          }
          override function toString() : String {
            return u.UserFriendlyDataType
          }
        }
        result.put(u.UserFriendlyDataType, aFilter)
      }
    }
    return result.Values.toTypedArray().sortBy(\ a -> a.toString())
  }
   
  static function filtersForModifierDataTypes( usages : List<InScopeUsage>, restrictToDataTypes : Set<IType>): BeanBasedQueryFilter[] {
    var result = new HashMap<String, BeanBasedQueryFilter>()
    for (u in usages) {
      if(u.IsModifier and (restrictToDataTypes == null || restrictToDataTypes.hasMatch(\ i -> TypeMaps.isAssignable(i, u.FeatureType)))) {       
        var aFilter = new BeanBasedQueryFilter(){
          override function applyFilter( obj : Object ) : boolean {
            var usage = obj as InScopeUsage
            return usage.UserFriendlyDataType == u.UserFriendlyDataType
          }
          override function toString() : String {
            return u.UserFriendlyDataType
          }
        }
        result.put(u.UserFriendlyDataType, aFilter)
      }
    }
    return result.Values.toTypedArray().sortBy(\ a -> a.toString())
  }
   
  private function getAllTargetElements() : List<InScopeUsage> {

    var selectedParamName = _valueDelegate.InScopeParam

    if (selectedParamName == null or selectedParamName == TC_COSTDATA) {
      return {}
    }

    var paramSet = _step.CalcRoutineDefinition.ParameterSet
    var selectedParam = paramSet.Parameters.singleWhere(\ c -> c.Code == selectedParamName)

    var regt = new RatingEntityGraphTraverser(paramSet)
    var usages = regt.getTargetableElementsForParameterSet(paramSet)

    return usages.get(selectedParam.Code) //getAllTargetElements(selectedParam, calcStep.CalcRoutineDefinition.PolicyLinePatternCode)
  }

  function commitEntitySelection() {
    if (_valueDelegate typeis CalcStepDefinitionArgument) {
      _valueDelegate.OverrideSource = true
    }
    
    _currentLocation.commit()    
  }

}
