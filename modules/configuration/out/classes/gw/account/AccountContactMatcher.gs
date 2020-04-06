package gw.account

uses gw.api.logicalmatch.AbstractPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches AccountContacts based on the ForeignKey to Contact
 */
@Export
class AccountContactMatcher extends AbstractPropertiesMatcher<AccountContact> {

  construct(acctContact : AccountContact) {
    super(acctContact)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {}
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {AccountContact.Type.TypeInfo.getProperty("Contact") as ILinkPropertyInfo}
  }

}
