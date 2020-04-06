package gw.lob.wc

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link WorkersCompCov}s based on the FK to the {@link WCLine} as well as the
 * properties defined in {@link AbstractCoverageMatcher}.
 */
@Export
class WorkersCompCovMatcher extends AbstractCoverageMatcher<WorkersCompCov> {

  construct(owner : WorkersCompCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {WorkersCompCov.Type.TypeInfo.getProperty("WCLine") as ILinkPropertyInfo}
  }

}