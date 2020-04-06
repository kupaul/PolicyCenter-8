package gw.coverage
uses gw.api.copy.GroupingCompositeCopier
uses gw.api.copy.Copier

/**
 * Copies all selected and existing {@link Coverage}s from a source {@link Coverable} to a target {@link Coverable}, using
 * {@link ClausePatternCopier} to copy the individual {@link Coverage}s and optionally removes all existing
 * {@link Coverage}s in destination {@link Coverable} which do not exist in source {@link Coverable}
 * using {@link RemovingClausePatternCopier}s.
 */
@Export
class AllCoverageCopier extends GroupingCompositeCopier<Copier<Coverable>, Coverable> {

  var _source : Coverable as readonly Source
  var _allExistingCoverageCopier : AllExistingCoverageCopier as AllExistingCoverageCopier
  var _allRemovingCoverageCopier : AllRemovingCoverageCopier
  
  construct(sourceCoverable : Coverable) {
    _source = sourceCoverable
    _allExistingCoverageCopier = new AllExistingCoverageCopier(_source)
    addCopier(_allExistingCoverageCopier)
    _allRemovingCoverageCopier = new AllRemovingCoverageCopier(_source)
    addCopier(_allRemovingCoverageCopier)
  }

  override function prepareRoot(root : Coverable) {
    if (ShouldCopyAll) {
      _allExistingCoverageCopier.ShouldCopyAll = true
      _allRemovingCoverageCopier.ShouldCopyAll = true
    }
  }
  
}
