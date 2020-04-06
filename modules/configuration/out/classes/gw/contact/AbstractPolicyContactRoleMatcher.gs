package gw.contact

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Abstract base implementation of {@link AbstractEffDatedPropertiesMatcher} for PolicyContactRoles.  All
 * PolicyContactRoles match on at least the FK to the AccountContactRole; subtypes may provide additional
 * columns to match on.
 */
@Export
abstract class AbstractPolicyContactRoleMatcher<T extends PolicyContactRole> extends AbstractEffDatedPropertiesMatcher<T> {

  construct(role : T) {
    super(role)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {}
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {T.Type.TypeInfo.getProperty("AccountContactRole") as ILinkPropertyInfo}
  }

}
