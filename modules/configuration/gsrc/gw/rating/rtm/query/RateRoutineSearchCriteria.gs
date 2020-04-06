package gw.rating.rtm.query

uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.search.EntitySearchCriteria
uses gw.api.productmodel.PolicyLinePatternLookup

@Export
class RateRoutineSearchCriteria extends EntitySearchCriteria<CalcRoutineDefinition> {
  var _policyLine : String as PolicyLine
  var _code : String
  var _name : String

  construct() {
    _code = ""
    _name = ""
  }

  property set RoutineCode(code : String) {
    _code = code ?: ""
  }

  property get RoutineCode() : String {
    return _code
  }

  property set RoutineName(name : String) {
    _name = name ?: ""
  }

  property get RoutineName() : String {
    return _name
  }

  override protected function doSearch() : IQueryBeanResult<CalcRoutineDefinition> {
    var query = Query.make<CalcRoutineDefinition>(CalcRoutineDefinition)
    if (PolicyLine.NotBlank) {
      query.contains("PolicyLinePatternCode", PolicyLine, true) 
    }
    if (RoutineCode.NotBlank) {
      query.contains("Code", RoutineCode, true)
    }
    if (RoutineName.NotBlank) {
      query.contains("Name", RoutineName, true)
    }
    return query.select()
  }

  // note: this is a copy & paste of the policyLineCodeToDescription function in RateBookEnhancement
  function policyLineCodeToDescription(code : String) : String {
    return PolicyLinePatternLookup.getByCode(code).DisplayName
  }

  override property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return null
  }

}
