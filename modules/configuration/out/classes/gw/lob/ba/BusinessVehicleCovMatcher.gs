package gw.lob.ba

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link BusinessVehicleCov}s based on the owning BusinessVehicle as well as the properties
 * defined in {@link AbstractCoverageMatcher}.
 */
@Export
class BusinessVehicleCovMatcher extends AbstractCoverageMatcher<BusinessVehicleCov> {
  construct(owner : BusinessVehicleCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {BusinessVehicleCov.Type.TypeInfo.getProperty("Vehicle") as ILinkPropertyInfo}
  }
}
