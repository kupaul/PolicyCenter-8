package gw.lob.im.ar

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link IMAccountsRecCov}s based on the FK to the {@link IMAccountsReceivable} as well as the
 * properties defined in {@link AbstractCoverageMatcher}.
 */
@Export
class IMAccountsRecCovMatcher extends AbstractCoverageMatcher<IMAccountsRecCov> {

  construct(owner : IMAccountsRecCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {IMAccountsRecCov.Type.TypeInfo.getProperty("IMAccountsReceivable") as ILinkPropertyInfo}
  }
  
}
