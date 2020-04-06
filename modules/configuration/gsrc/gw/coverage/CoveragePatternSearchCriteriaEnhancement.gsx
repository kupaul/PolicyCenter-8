package gw.coverage

uses gw.api.productmodel.ClausePattern
uses gw.api.productmodel.ConditionPattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.ExclusionPattern
uses gw.api.productmodel.PolicyLinePattern
uses gw.api.system.PCDependenciesGateway
uses gw.api.productmodel.ConditionPattern
uses gw.api.productmodel.ExclusionPattern

enhancement CoveragePatternSearchCriteriaEnhancement : gw.productmodel.ClausePatternSearchCriteria {
  
  /**
   * Retrieves coverages on the line, filtered by the keyword/coverage category 
   * of the search criteria
   * @param - linePattern: the line pattern used for retrieving coverages on this line
   * @return - a list of coverage patterns matching the search criteria
   * @deprecated Replaced by gw.coverage.ClausePatternSearchCriteria.gs in PolicyCenter 8.0.
   */
  function performSearch(linePattern : PolicyLinePattern) : CoveragePattern[] {
    var allCoverages = linePattern.CoverageCategories.flatMap(\ category -> category.CoveragePatterns).toTypedArray()
    if (this.CoverageCategoryCode != null) {
      allCoverages = allCoverages.where(\ cov -> cov.CoverageCategory.Code == this.CoverageCategoryCode)
    }
    if (this.Keyword != null) {
      allCoverages = allCoverages.where(\ cov -> cov.Name.toLowerCase().contains(this.Keyword.toLowerCase()))
    }
    return allCoverages
  }

  /**
   * Retrieves clause patterns (Coverages, Conditions and Exclusions) on the line, filtered by the keyword/coverage category 
   * of the search criteria
   * @param - linePattern: the line pattern used for retrieving clauses on this line
   * @return - a list of clause patterns matching the search criteria
   * @deprecated Replaced by gw.coverage.ClausePatternSearchCriteria.gs in PolicyCenter 8.0.
   */
  function performClausePatternSearch(linePattern : PolicyLinePattern) : ClausePattern[] {
    var clauseType : Type<? extends ClausePattern>
    clauseType = CoveragePattern
    switch (this.SearchType) {
      case CoveragePatternSearchType.TC_COVERAGE:
        clauseType = CoveragePattern
        break
      case CoveragePatternSearchType.TC_CONDITION:
        clauseType = ConditionPattern
        break
      case CoveragePatternSearchType.TC_EXCLUSION:
        clauseType = ExclusionPattern
        break
    }
    var allClausePatterns : ClausePattern[]
    if(linePattern == null){
      allClausePatterns = PCDependenciesGateway.getProductModel().getAllInstances(clauseType).toTypedArray()
    } else {
      allClausePatterns = linePattern.CoverageCategories.flatMap(\ c -> c.getClausePatterns(clauseType)).toTypedArray()
    }
    if (this.Keyword != null) {
      allClausePatterns = allClausePatterns.where(\ clausePattern -> clausePattern.Name.toLowerCase().contains(this.Keyword.toLowerCase()))
    }
    return allClausePatterns
  }
}
