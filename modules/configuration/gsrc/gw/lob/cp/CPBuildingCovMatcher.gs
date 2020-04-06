package gw.lob.cp
uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches CPBuildingCovs based on the PatternCode and CPBuilding.  Unfortunately CPBuildings do not have appropriate
 * fields to match on out of the box, so the best we can do is to match on the FixedID itself.  Implementations that do
 * have fields to match on for CPBuildings should make them matchers and change the below code to leverage that matcher.
 */
@Export
class CPBuildingCovMatcher extends AbstractCoverageMatcher<CPBuildingCov> {

  construct(cov : CPBuildingCov) {
    super(cov)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {CPBuildingCov.Type.TypeInfo.getProperty("CPBuilding") as ILinkPropertyInfo}
  }

}
