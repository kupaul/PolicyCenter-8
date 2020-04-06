package gw.lob.pa
uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses java.lang.Iterable
uses gw.entity.IEntityPropertyInfo

/**
 * Matches PersonalVehicles for OOS and Preemption jobs.  PersonalVehicles are matched based on their VIN
 * when the VIN is defined, and on the QuickQuoteNumber otherwise (QuickQuote only)
 */
@Export
class PersonalVehicleMatcher extends AbstractEffDatedPropertiesMatcher<PersonalVehicle> {
  
  construct(owner : PersonalVehicle) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {PersonalVehicle.Type.TypeInfo.getProperty("Vin") as IEntityPropertyInfo}
  }

  override function isLogicalMatch(bean : PersonalVehicle) : boolean {
    return _entity.Vin.HasContent
      ? super.isLogicalMatch(bean)
      : (_entity.QuickQuoteNumber != null) && (_entity.QuickQuoteNumber == bean.QuickQuoteNumber)
  }
  
  override function isLogicalMatchUntyped(bean : KeyableBean) : boolean {
    if (bean typeis PersonalVehicle) {
      return isLogicalMatch(bean)
    } else {
      return false
    }
  }
}