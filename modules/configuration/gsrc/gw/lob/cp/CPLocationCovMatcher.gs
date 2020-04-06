package gw.lob.cp

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches CPLocationCovs based on the CPLocation and the PatternCode.  We do not provide any CPLocationCovs
 * out of the box, so this matcher is not as fully tested as other matchers; customers who add actual
 * CPLocationCovs should check this code out more thoroughly to verify it meets their needs.
 */
@Export
class CPLocationCovMatcher extends AbstractCoverageMatcher<CPLocationCov> {

  construct(cov : CPLocationCov) {
    super(cov)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {CPLocationCov.Type.TypeInfo.getProperty("CPLocation") as ILinkPropertyInfo}
  }

}
