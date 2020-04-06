package gw.coverage
uses entity.Coverable
uses gw.coverage.ClausePatternCopier
uses gw.api.copy.GroupingCompositeCopier

/**
 * Copies all selected exclusions from a source Coverable to a target Coverable, using
 * {@link ClausePatternCopier} to copy the individual exclusions.
 */
@Export
class AllExclusionCopier extends GroupingCompositeCopier<ClausePatternCopier, Coverable> {

  var _coverable : Coverable as readonly Source

  construct(coverable : Coverable) {
    _coverable = coverable
    _coverable.ExclusionsFromCoverable.sortBy(\ c -> c.DisplayName).each(\ c -> addCopier(new ClausePatternCopier(c)))
  }

  override function prepareRoot(root : Coverable) {
    if (not root.InitialExclusionsCreated) {
      root.createExclusions()
    }
  }

}
