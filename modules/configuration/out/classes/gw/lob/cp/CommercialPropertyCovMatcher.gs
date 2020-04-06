package gw.lob.cp

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches CommercialPropertyCovs based on the CPLine and the PatternCode.  We do not provide any CommercialPropertyCovs
 * out of the box, so this matcher is not as fully tested as other matchers; customers who add actual
 * CommercialPropertyCovs should check this code out more thoroughly to verify it meets their needs.
 */
@Export
class CommercialPropertyCovMatcher extends AbstractCoverageMatcher<CommercialPropertyCov> {

  construct(owner : CommercialPropertyCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {CommercialPropertyCov.Type.TypeInfo.getProperty("CPLine") as ILinkPropertyInfo}
  }

}