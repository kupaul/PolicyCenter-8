package gw.lob.ba
uses gw.lob.common.AbstractModifierMatcher
uses gw.entity.ILinkPropertyInfo
uses java.lang.Iterable

/**
 * Matches BusinessVehicleModifier based on the owning {@link BusinessVehicle} as well as the properties
 * defined in {@link AbstractModifierMatcher}
 */
@Export
class BusinessVehicleModifierMatcher extends AbstractModifierMatcher<BusinessVehicleModifier> {
  
  construct(owner : BusinessVehicleModifier) {
    super(owner)
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {BusinessVehicleModifier.Type.TypeInfo.getProperty("Vehicle") as ILinkPropertyInfo}
  }
}
