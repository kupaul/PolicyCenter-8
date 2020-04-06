package gw.coverage
uses gw.api.copy.Copier
uses gw.api.productmodel.ClausePattern

/**
 * Removes all existing {@link Coverage}s in the target {@link Coverable} which do not exist in the source
 * {@link Coverable}.
 */
@Export
class RemovingClausePatternCopier extends Copier<Coverable> {

  var _source : ClausePattern as readonly Source

  construct(clausePattern : ClausePattern) {
    _source = clausePattern
  }
  
  /**
   * Removes existing {@link ClausePattern} in target {@link Coverable} if it matches source {@link ClausePattern}.
   */
  override function copy(target : Coverable) {
    var targetClause = target.getCoverageConditionOrExclusion(_source)
    if (targetClause != null) {
      target.removeCoverageConditionOrExclusionFromCoverable(targetClause)
    }
  }
}
