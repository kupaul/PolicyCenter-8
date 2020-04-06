package gw.lob.pa

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link PersonalVehicleCov}s based on the FK to the {@link PersonalVehicle} as well as the
 * properties defined in {@link AbstractCoverageMatcher}.
 */
@Export
class PersonalVehicleCovMatcher extends AbstractCoverageMatcher<PersonalVehicleCov> {

  construct(owner : PersonalVehicleCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {PersonalVehicleCov.Type.TypeInfo.getProperty("PersonalVehicle") as ILinkPropertyInfo}
  }

}
