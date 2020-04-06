package gw.lob.im.ar

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link IMAccountsReceivable}s based on the FKs to the {@link IMAccountsRecPart} and
 * {@link IMBuilding} as well as the ID.  Note that this means that a IMAccountsReceivable will
 * only ever match the same row in the database.
 */
@Export
class IMAccountsReceivableMatcher extends AbstractEffDatedPropertiesMatcher<IMAccountsReceivable> {

  construct(owner : IMAccountsReceivable) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return { IMAccountsReceivable.Type.TypeInfo.getProperty("ID") as IEntityPropertyInfo}
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return { IMAccountsReceivable.Type.TypeInfo.getProperty("IMAccountsRecPart") as ILinkPropertyInfo ,
             IMAccountsReceivable.Type.TypeInfo.getProperty("IMBuilding") as ILinkPropertyInfo }
  }
}
