package gw.policylocation

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link PolicyLocation}s based on the FK to the {@link AccountLocation}.
 */
@Export
class PolicyLocationMatcher extends AbstractEffDatedPropertiesMatcher<PolicyLocation>{

  construct(loc : PolicyLocation) {
    super(loc)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {PolicyLocation.Type.TypeInfo.getProperty("AccountLocation") as IEntityPropertyInfo}
  }

}
