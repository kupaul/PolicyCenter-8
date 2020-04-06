package gw.account

@Export
class EffDatedDefaultMergeableImpl extends AbstractEffDatedMergeableImpl<EffDated> {
  construct(mergeable : EffDated) {
    super(mergeable)
  }

  override function mergeFields(merged : EffDated) : boolean {
    return true
  }
}