package gw.lob.wc

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link WCStateCov}s based on the FK to the {@link WCJurisdiction} as well as the
 * properties defined in {@link AbstractCoverageMatcher}.
 */
@Export
class WCStateCovMatcher extends AbstractCoverageMatcher<WCStateCov> {

  construct(owner : WCStateCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {WCStateCov.Type.TypeInfo.getProperty("WCJurisdiction") as ILinkPropertyInfo}
  }

}