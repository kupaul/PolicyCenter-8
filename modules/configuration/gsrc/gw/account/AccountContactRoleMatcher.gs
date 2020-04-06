package gw.account

uses gw.api.logicalmatch.AbstractPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link AccountContactRole}s based on the Subtype (Driver, Named Insured, etc.) and ForeignKey 
 * to {@link AccountContact}
 */
@Export
class AccountContactRoleMatcher extends AbstractPropertiesMatcher<AccountContactRole> {

  construct(acr : AccountContactRole) {
    super(acr)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {AccountContactRole.Type.TypeInfo.getProperty("Subtype") as IEntityPropertyInfo}
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {AccountContactRole.Type.TypeInfo.getProperty("AccountContact") as ILinkPropertyInfo}
  }

}
