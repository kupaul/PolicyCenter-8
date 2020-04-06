package gw.policy

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link LocationNamedInsured}s based on the FKs to the {@link NamedInsured} and {@link PolicyLocation}.
 */
@Export
class LocationNamedInsuredMatcher extends AbstractEffDatedPropertiesMatcher<LocationNamedInsured> {

  construct(locNamedInsured : LocationNamedInsured) {
    super(locNamedInsured)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {}
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {LocationNamedInsured.Type.TypeInfo.getProperty("Location") as ILinkPropertyInfo,
            LocationNamedInsured.Type.TypeInfo.getProperty("NamedInsured") as ILinkPropertyInfo}
  }

}
