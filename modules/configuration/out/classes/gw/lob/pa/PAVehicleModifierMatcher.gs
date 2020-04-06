package gw.lob.pa
uses gw.lob.common.AbstractModifierMatcher
uses gw.entity.ILinkPropertyInfo
uses java.lang.Iterable

/**
 * Matches {@link PAVehicleModifier}s based on the FK to the {@link PersonalVehicle} as well as the
 * properties defined in {@link AbstractModifierMatcher}.
 */
@Export
class PAVehicleModifierMatcher extends AbstractModifierMatcher<PAVehicleModifier> {

  construct(owner : PAVehicleModifier) {
    super(owner)
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {PAVehicleModifier.Type.TypeInfo.getProperty("PAVehicle") as ILinkPropertyInfo}
  }

}
