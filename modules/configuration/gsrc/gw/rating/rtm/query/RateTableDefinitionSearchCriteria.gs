package gw.rating.rtm.query

uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.search.EntitySearchCriteria

@Export
class RateTableDefinitionSearchCriteria extends EntitySearchCriteria<RateTableDefinition> {
  var _code : String
  var _name : String
  var _policyLine : String as PolicyLine

  construct() {
    _code = ""
    _name = ""
  }

  property set TableCode(code : String) {
    _code = code ?: ""
  }

  property get TableCode() : String {
    return _code
  }

  property set TableName(name : String) {
    _name = name ?: ""
  }

  property get TableName() : String {
    return _name
  }

  override protected function doSearch() : IQueryBeanResult<RateTableDefinition> {
    var query = Query.make<RateTableDefinition>(RateTableDefinition)

    if (PolicyLine.NotBlank) query.compare("PolicyLine", Equals, _policyLine)
    if (TableCode.NotBlank)  query.contains("TableCode", TableCode, true)
    if (TableName.NotBlank)  query.contains("TableName", TableName, true)

    return query.select()
  }

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return null
  }

}