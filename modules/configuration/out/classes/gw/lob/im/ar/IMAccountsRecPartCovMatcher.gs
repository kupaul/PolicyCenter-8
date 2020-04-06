package gw.lob.im.ar

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link IMAccountsRecPartCov}s based on the FK to the {@link IMAccountsRecPart} as well as the
 * properties defined in {@link AbstractCoverageMatcher}.
 */
@Export
class IMAccountsRecPartCovMatcher extends AbstractCoverageMatcher<IMAccountsRecPartCov> {

  construct(owner : IMAccountsRecPartCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {IMAccountsRecPartCov.Type.TypeInfo.getProperty("IMAccountsRecPart") as ILinkPropertyInfo}
  }
  
}