package gw.lob.ba
uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses java.lang.Iterable
uses gw.entity.IEntityPropertyInfo

/**
 * Matcher for {@link BusinessVehicle}.  Currently, it matches on the {@link entity.BusinessVehicle#VIN VIN} number.
 */
@Export
class BusinessVehicleMatcher extends AbstractEffDatedPropertiesMatcher<BusinessVehicle> {
  
  construct(owner : BusinessVehicle) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {BusinessVehicle.Type.TypeInfo.getProperty("Vin") as IEntityPropertyInfo}
  }

}
