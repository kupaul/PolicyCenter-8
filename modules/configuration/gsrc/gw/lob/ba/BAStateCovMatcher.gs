package gw.lob.ba

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches BAStateCovs for OOS and Preemption based on the BAJurisdiction
 */
@Export
class BAStateCovMatcher extends AbstractCoverageMatcher<BAStateCov> {

  construct(owner : BAStateCov) {
    super(owner)
  }
  
  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {BAStateCov.Type.TypeInfo.getProperty("BAJurisdiction") as ILinkPropertyInfo}
  }
  
}
