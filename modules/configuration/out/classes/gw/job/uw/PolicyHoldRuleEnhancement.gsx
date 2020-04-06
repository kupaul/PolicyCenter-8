package gw.job.uw

uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.ClausePatternLookup
uses gw.api.productmodel.PolicyLinePattern

enhancement PolicyHoldRuleEnhancement : entity.PolicyHoldRule {

  /**
   * @return the coverage pattern associated with this rule.
   */
  property get CovPattern() : CoveragePattern {
    return ClausePatternLookup.getCoveragePatternByCode(this.CovPatternCode)
  }
  
  /**
   * Set the coverage pattern associated with this rule.
   * 
   * @param pattern the coverage pattern to set.
   */
  property set CovPattern(pattern : CoveragePattern) {
    this.CovPatternCode = pattern.Code
  }

  /**
   * Get the policy line pattern that matches this rule's associated policy line type.
   * 
   */
  function getMatchingLinePattern(patterns : PolicyLinePattern []) : PolicyLinePattern {
    return patterns.singleWhere(\ p -> p.PolicyLineSubtype.Code == this.PolicyLineType.Code)
  }
}
