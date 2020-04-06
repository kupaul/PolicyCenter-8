package gw.lob.gl

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link GeneralLiabilityCov}s based on the FK to the General Liability Line as well as the
 * properties defined in {@link AbstractCoverageMatcher}.
 */
@Export
class GeneralLiabilityCovMatcher extends AbstractCoverageMatcher<GeneralLiabilityCov> {

  construct(owner : GeneralLiabilityCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {GeneralLiabilityCov.Type.TypeInfo.getProperty("GLLine") as ILinkPropertyInfo}
  }
  
}