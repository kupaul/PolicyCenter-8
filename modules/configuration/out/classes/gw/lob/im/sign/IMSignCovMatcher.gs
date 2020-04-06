package gw.lob.im.sign

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link IMSignCov}s based on the FK to the {@link IMSign} as well as the
 * properties defined in {@link AbstractCoverageMatcher}.
 */
@Export
class IMSignCovMatcher extends AbstractCoverageMatcher<IMSignCov> {

  construct(owner : IMSignCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {IMSignCov.Type.TypeInfo.getProperty("IMSign") as ILinkPropertyInfo}
  }
  
}