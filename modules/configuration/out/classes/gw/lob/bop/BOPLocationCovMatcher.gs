package gw.lob.bop

uses entity.BOPLocationCov

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

uses java.util.List

/**
 * Matches {@link BOPLocationCov}s based on the FK to BOPLocation, as well as the properties defined in
 * {@link AbstractCoverageMatcher}.
 */
@Export
class BOPLocationCovMatcher extends AbstractCoverageMatcher<BOPLocationCov> {

  construct(owner : BOPLocationCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {BOPLocationCov.Type.TypeInfo.getProperty("BOPLocation") as ILinkPropertyInfo}
  }
}
