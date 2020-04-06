package gw.rating.flow

uses gw.lang.reflect.TypeSystem
uses gw.rating.flow.util.InScopeUsage
uses gw.rating.flow.util.RatingEntityGraphTraverser
uses java.util.Map
uses gw.api.database.Query
uses java.lang.IllegalStateException
uses java.lang.IllegalArgumentException
uses gw.rating.flow.util.RatingEntityGraphTraverser

enhancement CalcRoutineParameterSetEnhancement : entity.CalcRoutineParameterSet {

  property get WritableParameterUsages() : Map<CalcRoutineParameter,List<InScopeUsage>>{
    return RatingEntityGraphTraverser.getWritableTargetElements(this)
  }

  static property get ParamSetsReferencedForRoutinesInPromotedBook() : java.util.Set<String> {
    var promotedRateBooksQuery = new Query(RateBook).compare("Status", NotEquals, RateBookStatus.TC_DRAFT)

    var routineDefQuery = new Query(CalcRoutineDefinition)
    routineDefQuery.join(RateBookCalcRoutine, "CalcRoutineDefinition").subselect("RateBook",CompareIn,promotedRateBooksQuery,"ID")

    var paramSetQuery = new Query(CalcRoutineParameterSet)
    return (paramSetQuery.subselect("ID", CompareIn, routineDefQuery, "ParameterSet").select()
            .whereTypeIs(CalcRoutineParameterSet).map(\crps -> crps.Code).toSet())
  }

  static property get ParamSetsReferencedInRateTableDefinitions() : java.util.Set<String> {
    var paramSetQuery = new Query(CalcRoutineParameterSet)
    return paramSetQuery.join(RateTableArgumentSourceSet, "CalcRoutineParameterSet").select()
                        .whereTypeIs(CalcRoutineParameterSet).map(\crps -> crps.Code).toSet()
  }

  static property get ParamSetsReferencedInRateTableDefinitionsInPromotedBooks() : java.util.Set<String> {
    var promotedRateBooksQuery = new Query(RateBook).compare("Status", NotEquals, RateBookStatus.TC_DRAFT)

    var paramSetQuery = new Query(CalcRoutineParameterSet)
    .join(RateTableArgumentSourceSet, "CalcRoutineParameterSet")
    .join("RateTableDefinition")
    .join(RateTable, "Definition").subselect("RateBook",CompareIn,promotedRateBooksQuery,"ID")

    return (paramSetQuery.select().whereTypeIs(CalcRoutineParameterSet).map(\crps -> crps.Code).toSet())
  }

  public function validateParamMap(paramNameObjMap : Map<CalcRoutineParamName,Object>) {
    if (this.Parameters.Count > 0 && this.Parameters.Count > 0) {
      var unAccountedForParams = this.Parameters*.Code.toSet().subtract(paramNameObjMap.Keys)
      if (unAccountedForParams.Count > 0) {
        throw new IllegalStateException("The following parameters are needed to execute rate routine: " + 
              unAccountedForParams.map(\p -> p.Code).join(","))
      }
      this.Parameters.each(\param -> {
        var paramObj = paramNameObjMap.get(param.Code)
        if (paramObj == null) {
          return // Allow null targets
        }
        var paramTypeStr = param.ParamType
        var classType = TypeSystem.getByFullNameIfValid(param.ParamType)
        if (classType==null) {
          throw new IllegalStateException("Invalid parameter type: " + param.ParamType)
        }

        var paramObjType = typeof paramObj
        if (!classType.isAssignableFrom(paramObjType)) {
          throw new IllegalArgumentException("Expected Parameter name: " + param.Code.DisplayName + "(" + param.Code + ")" +
                                             " to be of type: " + paramTypeStr +
                                             " but was type: " + paramObjType.Name)
        }
      })
    }
  }

}
