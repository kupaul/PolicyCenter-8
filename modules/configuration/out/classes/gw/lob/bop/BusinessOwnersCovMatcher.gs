package gw.lob.bop

uses entity.BusinessOwnersCov

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

uses java.util.List

/**
 * Matches {@link BusinessOwnersCov}s based on the Business Owners Line as well as the properties defined in
 * {@link AbstractCoverageMatcher}
 */
@Export
class BusinessOwnersCovMatcher extends AbstractCoverageMatcher<BusinessOwnersCov> {

  construct(owner : BusinessOwnersCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {BusinessOwnersCov.Type.TypeInfo.getProperty("BOPLine") as ILinkPropertyInfo}
  }
  
}
