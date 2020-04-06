package gw.lob.common
uses gw.search.EntitySearchCriteria
uses gw.api.database.IQueryBeanResult
uses java.util.Date
uses gw.api.system.lookuptables.DBTerritoryBestMatcher

/**
 * A search criteria used for Territory code lookup in the UI.
 */
@Export
class TerritoryLookupCriteria extends EntitySearchCriteria<DBTerritory> {
  var _city : String as City
  var _county : String as County  
  var _postalCode : String as PostalCode
  var _code : String as Code
  var _description : String as Description
  var _previousCode : String as PreviousCode
  var _policyLinePatternCode : String as PolicyLinePatternCode
  var _effectiveOnDate : Date as EffectiveOnDate
  var _state : Jurisdiction as State
  

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    if (_policyLinePatternCode.NotBlank and _state != null and _effectiveOnDate != null) {
      return null
    }
    return displaykey.TerritoryLookupCriteria.Error.MinimumCriteria
  }

  override protected function doSearch() : IQueryBeanResult {
    var queryBuilder = new TerritoryLookupQueryBuilder()
      .withCity(_city)
      .withCounty(_county)
      .withPostalCode(_postalCode)
      .withCode(_code)
      .withDescription(_description)
      .withPolicyLinePatternCode(_policyLinePatternCode)
      .withEffectiveOnDate(_effectiveOnDate)
      .withState(_state)
      .build()
  var result : IQueryBeanResult
    // don't need to do union if searching for specific code and the code is not previous code
    if (_previousCode != null and (_code == null or _previousCode.startsWith(_code))) {
      //shouldn't add restrictions on dates searching by previous code 
      var previousCodeQueryBuilder = new TerritoryLookupQueryBuilder()
        .withCity(_city)
        .withCounty(_county)
        .withPostalCode(_postalCode)
        .withDescription(_description)
        .withCode(_previousCode)
        .withPolicyLinePatternCode(_policyLinePatternCode)
        .withState(_state)
        .build()    
      result = queryBuilder.union(previousCodeQueryBuilder).select()
    } else {
      result = queryBuilder.select()
    }
    
    return new DBTerritoryBestMatcher().findBestMatch(result as IQueryBeanResult<DBTerritory>, _postalCode, _city)
  }

}
