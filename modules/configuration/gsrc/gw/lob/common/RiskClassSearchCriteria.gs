package gw.lob.common
uses gw.search.EntitySearchCriteria
uses gw.api.database.IQueryBeanResult
uses gw.lob.common.RiskClassQueryBuilder

/**
 * A search criteria used for searching RiskClass via the UI.
 */
@Export
class RiskClassSearchCriteria extends EntitySearchCriteria<RiskClass> {
  var _coveragePatternCode : String as CoveragePatternCode
  var _description : String as Description
  var _policyLinePatternCode : String as PolicyLinePatternCode

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return _policyLinePatternCode.NotBlank ? null : displaykey.RiskClassSearchCriteria.Error.MinimumCriteria
  }

  override protected function doSearch() : IQueryBeanResult {
    return new RiskClassQueryBuilder()
        .withDescriptionContained(_description)
        .withCoveragePatternCode(_coveragePatternCode)
        .withPolicyLinePatternCode(_policyLinePatternCode)
        .build().select()
  }

}
