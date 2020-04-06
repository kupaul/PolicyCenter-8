package gw.lob.ba

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link BusinessAutoCov} based on the BALine, as well as the properties defined in
 * {@link AbstractCoverageMatcher}
 */
@Export
class BusinessAutoCovMatcher extends AbstractCoverageMatcher<BusinessAutoCov> {

  construct(owner : BusinessAutoCov) {
    super(owner)
  }
  
  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {BusinessAutoCov.Type.TypeInfo.getProperty("BALine") as ILinkPropertyInfo}
  }
  
}
