package gw.product
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.effdate.EffDatedFinderUtil
uses gw.search.EntitySearchCriteria

@Export
class IndustryCodeSearchCriteria extends EntitySearchCriteria<IndustryCode> {
  
  var _code : String as Code
  var _previousCode : String as PreviousCode
  var _classification : String as Classification
  var _effectiveOnDate : DateTime as EffectiveOnDate
  var _domain : IndustryCodeType as Domain
  
  override protected function doSearch() : IQueryBeanResult<IndustryCode> {
    var query = constructBaseQuery()
    if (Code != null) {
      query.startsWith("Code", Code, true)
    }
    if (EffectiveOnDate != null) {
      EffDatedFinderUtil.addRestrictionsForEffectiveOnDate(query, EffectiveOnDate)
    }
    // don't need to do union if it's searching for specific code and the code is not previous code
    if (PreviousCode != null and 
        (Code == null || PreviousCode.startsWith(Code))) {
      return query.union(getPreviousSelectedIndustryCode()).select() 
    }
    return query.select()
  }
  
  function constructBaseQuery() : Query<IndustryCode> {
    var q = new Query<IndustryCode>(IndustryCode)
    if (Domain != null) {
      q.compare("Domain", Equals, Domain)
    } 
    if (Classification != null) {
      q.contains("Classification", Classification, true)
    }
    return q  
  }
  
  function getPreviousSelectedIndustryCode() : Query<IndustryCode> {
    var query = constructBaseQuery()
    if (PreviousCode != null) {
      query.compare("Code", Equals, PreviousCode)
    }
    return query
  }

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return null
  }

}
