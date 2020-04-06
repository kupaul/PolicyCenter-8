package gw.lob.bop

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

uses java.util.List
uses productmodel.BOPBuildingCov

/**
 * Matches {@link BOPBuildingCov}s based on the FK to BOPBuilding, in addition to the properties defined
 * in {@link AbstractCoverageMatcher}.
 */
@Export
class BOPBuildingCovMatcher extends AbstractCoverageMatcher<BOPBuildingCov> {

  construct(owner : BOPBuildingCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {BOPBuildingCov.Type.TypeInfo.getProperty("BOPBuilding") as ILinkPropertyInfo}
  }
  
}
