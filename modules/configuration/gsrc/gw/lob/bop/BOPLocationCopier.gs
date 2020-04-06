package gw.lob.bop
uses gw.api.copier.AbstractEffDatedCopyable

/**
 * A Copier for {@link entity.BOPLocation}.  Copies BOPLocation specific fields.
 * <ul><li>entity.BOPLocation#PrincipalOpsDesc</li></ul>
 */
@Export
class BOPLocationCopier extends AbstractEffDatedCopyable<BOPLocation> {

  construct(loc : BOPLocation) {
    super(loc)
  }

  override function copyBasicFieldsFromBean(location : BOPLocation) {
    this._bean.PrincipalOpsDesc = location.PrincipalOpsDesc
  }

}
