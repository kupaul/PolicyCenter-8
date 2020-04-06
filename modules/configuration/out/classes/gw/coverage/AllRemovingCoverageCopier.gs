package gw.coverage
uses gw.api.copy.GroupingCompositeCopier

/**
 * This copier is responsible  ensuring that deselected coverages are not copied or inadvertantly created.
 */
@Export
class AllRemovingCoverageCopier extends GroupingCompositeCopier<RemovingClausePatternCopier, Coverable> {

  var _coverable : Coverable as readonly Source

  construct(coverable : Coverable) {
    _coverable = coverable
    var categories = _coverable.PolicyLine.Pattern.CoverageCategories
    var patterns = categories*.coveragePatternsForEntity(typeof coverable)
    var nonExistingPatterns = patterns.where(\ p -> not _coverable.hasCoverageConditionOrExclusion(p))
    nonExistingPatterns.each(\ p -> addCopier(new RemovingClausePatternCopier(p)))
  }

}
