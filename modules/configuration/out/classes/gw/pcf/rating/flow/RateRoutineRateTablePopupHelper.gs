package gw.pcf.rating.flow

uses gw.lang.reflect.IType
uses gw.rating.flow.MultiFactorVariable
uses gw.rating.flow.util.TypeMaps
uses java.lang.IllegalStateException
uses java.util.ArrayList
uses java.util.HashMap
uses java.util.LinkedHashMap
uses java.util.Map
uses java.util.Set
uses gw.api.util.DisplayableException
uses gw.rating.flow.validation.RateRoutineValidation

@Export
class RateRoutineRateTablePopupHelper {

  static var _allFactorsCode : String as readonly AllFactorsCode = "_ALL_FACTORS"

  var _operand : CalcStepDefinitionOperand
  var _popup : pcf.RateRoutineRateTablePopup
  var _tableDefs : List<RateTableDefinition>
  var _tableCodeFactorColNamesMap : Map<String, java.util.List<String>>
  var _routine : CalcRoutineDefinition

  construct(rateTablePopup : pcf.RateRoutineRateTablePopup,
            tabDefs : List<RateTableDefinition>,
            routine : CalcRoutineDefinition,
            operand : CalcStepDefinitionOperand,
            tabCodeFacColNamesMap : Map<String, java.util.List<String>>) {

    _popup = rateTablePopup
    _routine = routine
    _operand = operand
    _tableCodeFactorColNamesMap = tabCodeFacColNamesMap
    _tableDefs = tabDefs

  }

  static function initTableCodeFactorColNamesMap(rTables : List<RateTableDefinition>) : Map<String, java.util.List<String>> {
    var tabCodeFactorColNamesMap = new HashMap<String, java.util.List<String>>()
    if (rTables.Count > 0) {
      rTables.each(\rt -> tabCodeFactorColNamesMap.put(rt.TableCode, rt.Factors.orderBy(\f -> f.SortOrder).map(\rtc -> rtc.ColumnName).toList()))
    }
    return tabCodeFactorColNamesMap
  }

  static function parseRateTables(rTables : List<RateTableDefinition>) : Map<String,String> {
    var tabCodeNameMap = new LinkedHashMap<String,String>()
    if (rTables.Count > 0) {
      rTables.each(\rt -> tabCodeNameMap.put(rt.TableCode, rt.TableName))
    }
    return tabCodeNameMap
  }

  static function parseRateTablesForArgSrcSets(rTables : List<RateTableDefinition>) : Map<String,Map<String,String>> {
    var tabCodeArgSrcSetCodeNameMap = new LinkedHashMap<String,Map<String,String>>()
    if (rTables.Count > 0) {
      rTables.where(\rt ->rt.ArgumentSourceSets.Count > 0)
             .each(\rt -> {
                var argSrcSetCodeNameMap : Map<String,String> = {}
                rt.ArgumentSourceSets.each(\argSrcSet ->{
                  argSrcSetCodeNameMap.put(argSrcSet.Code, argSrcSet.Name)
                })
                tabCodeArgSrcSetCodeNameMap.put(rt.TableCode, argSrcSetCodeNameMap)
              })
      return tabCodeArgSrcSetCodeNameMap
    } else {
      return {}
    }
  }

  function getParamType(arg : CalcStepDefinitionArgument) : String {
    var valProvider = arg.FirstMatchingRateTableColumn.ValueProvider
    if (valProvider == null) {
      return arg.ColumnDataType.toString()
    }
    return "List"
  }

  function commitTableChanges() {
    if (_operand.TableCode.length > 0) {
      RateRoutineValidation.validateRateTableArgumentsForOperand(_routine, _operand, TC_LOADSAVE)
      _operand.TypeDeclaration = _operand.RateTableDefinition.getFactorIType(_operand.RateFactorColName).Name
    }
    _popup.commit()
  }

  function onTableChange(targetDataTypes : java.util.Set<gw.lang.reflect.IType>) {
    gw.api.web.PebblesUtil.invalidateIterators(_popup, entity.CalcStepDefinitionArgument)
    if (_operand.TableCode != null and _operand.RateTableDefinition != null) {
      _operand.resetArgumentSources()
      _operand.resetFactors()
      var firstTargetableFactor = getFactorRange(_operand.TableCode, targetDataTypes).first()
      if (firstTargetableFactor == null) {
        throw new IllegalStateException("Changed to table with no targetable factors")
      }
      _operand.RateFactorColName = firstTargetableFactor
      _operand.ArgumentSourceSetCode =
              _operand.ArgumentSourceSets.orderBy(\argSrcSet -> argSrcSet.Name).first().Code
    }
  }

  function onArgumentSourceSetChange() {
    gw.api.web.PebblesUtil.invalidateIterators(_popup, entity.CalcStepDefinitionArgument)
    _operand.resetArgumentSources()
  }

  function getArgumentSourceSetRange() : String[] {
    if (_operand.TableCode.HasContent) {
      var tabDef = _tableDefs?.firstWhere(\tabDef -> tabDef.TableCode == _operand.TableCode)
      if (tabDef == null) { return {} }
      return tabDef.ArgumentSourceSets.orderBy(\argSrcSet -> argSrcSet.Name).map(\argSrcSet -> argSrcSet.Code).toTypedArray()
    } else {
      return {}
    }
  }

  function getFactorRange(tabCode : String, targetDataTypes : Set<IType>) : String[] {
    var targetableFactorNames : List<String> = {}
    if (tabCode.length == 0) {
      return null
    }

    var tabDefs = _tableDefs.where(\tableDef -> tableDef.TableCode == tabCode)
    if (tabDefs.Empty) { // check required for the case of a missing or renamed Rate Table
      return {}
    }
    var tabDef = tabDefs[0]
    tabDef.Factors
          .where(\factor -> { var factorType = tabDef.getFactorIType(factor.ColumnName)
                              return ((targetDataTypes.Count == 0) or TypeMaps.isAssignable(targetDataTypes, factorType)) })
          .orderBy(\factor -> factor.SortOrder)
          .each(\factor ->targetableFactorNames.add(factor.ColumnName))

    if ((targetableFactorNames.Count > 1) and
        (targetDataTypes == null or TypeMaps.isAssignable(targetDataTypes, MultiFactorVariable))) {
      targetableFactorNames.add(AllFactorsCode)
    }
    return targetableFactorNames.toTypedArray()
  }

  function getColumnFactorLabel(factorColumnName : String) : String {
    if (factorColumnName == AllFactorsCode) {
      return displaykey.Web.Rating.Flow.CalcRoutine.RateTableReturnAllFactorsLabel
    } else if (_operand.TableCode != null and _operand.RateTableDefinition != null) {
      return _operand.RateTableDefinition.getFactorLabel(factorColumnName)
    } else {
      return ""
    }
  }

  function getTargetableTables(targetDataTypes : Set<IType>) : String[] {
    var targetableTabCodes : Set<String> = {}
    // No tables defined
    if (_tableDefs.Count == 0) {
      return {}
    }

    if (targetDataTypes.Count == 0 or targetDataTypes.allMatch(\ tdt -> tdt == null)) {
      return _tableDefs.map(\td -> td.TableCode).toTypedArray()
    }
      
    _tableDefs.each(\tabDef ->{
      if (tabDef.Factors.hasMatch(\factor -> {
            var factorType = tabDef.getFactorIType(factor.ColumnName)
            return ((targetDataTypes.Count == 0) or TypeMaps.isAssignable(targetDataTypes, factorType))
          })) {
        targetableTabCodes.add(tabDef.TableCode)
      }
    })
    return targetableTabCodes.toTypedArray()
  }
}
