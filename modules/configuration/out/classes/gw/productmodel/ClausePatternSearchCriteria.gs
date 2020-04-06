package gw.productmodel

uses gw.api.productmodel. *
uses gw.search.SearchCriteria

@Export
class ClausePatternSearchCriteria extends SearchCriteria<ClausePattern> {

  var _keyword : String as Keyword
  var _coverageCategoryCode : String as CoverageCategoryCode
  var _policyLinePatternCode : String as PolicyLinePatternCode
  var _searchType : CoveragePatternSearchType as SearchType

  override protected property get HasMinimumSearchCriteria() : boolean {
    return PolicyLinePatternLookup.getByCode(_policyLinePatternCode) != null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return displaykey.Web.Search.SearchCriteria.ClausePattern.MinCriteria
  }

  override protected function doSearch() : ClausePattern[] {
    var clauseTypes : List<Type<? extends ClausePattern>>
    switch (_searchType) {
      case CoveragePatternSearchType.TC_COVERAGE:
        clauseTypes = {CoveragePattern}
        break
      case CoveragePatternSearchType.TC_CONDITION:
        clauseTypes = {ConditionPattern}
        break
      case CoveragePatternSearchType.TC_EXCLUSION:
        clauseTypes = {ExclusionPattern}
        break
      case CoveragePatternSearchType.TC_EXCLCOND:
        clauseTypes = {ConditionPattern, ExclusionPattern}
        break
      default:
        clauseTypes = {ConditionPattern, ExclusionPattern, CoveragePattern}
    }

    var linePattern = PolicyLinePatternLookup.getByCode(_policyLinePatternCode)
    var allClausePatterns  = linePattern.CoverageCategories.flatMap(\c -> c.AllClausePatterns.where(\ l -> isSearchedType(clauseTypes, l)))

    if (_coverageCategoryCode != null) {
      allClausePatterns = allClausePatterns.where(\ clausePattern -> clausePattern.CoverageCategory.Code == this.CoverageCategoryCode)
    }

    if (this.Keyword != null) {
      allClausePatterns = allClausePatterns.where(\ c -> c.Name.containsIgnoreCase(this.Keyword))
    }
    return allClausePatterns.toTypedArray()
  }

  private function isSearchedType(clauseTypes : List<Type<? extends ClausePattern>>, pattern : ClausePattern) : boolean {
    for (t in clauseTypes) {
      if (t.isAssignableFrom(typeof pattern)) {
        return true
      }
    }
    return false
  }

  /**
   * @param coverageCategory the CoverageCategory to be matched
   */
  property set CoverageCategory(category : CoverageCategory) {
    if (category == null) {
      _coverageCategoryCode = null
      _policyLinePatternCode = null
    } else {
      _coverageCategoryCode = category.Code
      _policyLinePatternCode = category.PolicyLinePattern.Code
    }
  }

  /**
   * @return the CoverageCategory to be matched
   */
  property get CoverageCategory() : CoverageCategory {
    final var policyLinePattern = PolicyLinePatternLookup.getByCode(_policyLinePatternCode)
    if (policyLinePattern != null) {
      return policyLinePattern.getCoverageCategory(_coverageCategoryCode)
    }
    return null
  }

}
