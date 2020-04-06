package gw.lob.pa

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link VehicleDriver}s based on the FKs to the {@link PolicyDriver} and {@link PersonalVehicle}.
 */
@Export
class VehicleDriverMatcher extends AbstractEffDatedPropertiesMatcher<VehicleDriver> {

  construct(driver : VehicleDriver) {
    super(driver)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {}
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {VehicleDriver.Type.TypeInfo.getProperty("PolicyDriver") as ILinkPropertyInfo,
            VehicleDriver.Type.TypeInfo.getProperty("Vehicle") as ILinkPropertyInfo }
  }

}
