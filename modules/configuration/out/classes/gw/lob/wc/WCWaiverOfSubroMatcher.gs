package gw.lob.wc

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link WCWaiverOfSubro}s based on the FKs to the {@link WCLine} and {@link ClassCode} as well as the
 * {@link State} and {@link Type} columns.
 */
@Export
class WCWaiverOfSubroMatcher extends AbstractEffDatedPropertiesMatcher<WCWaiverOfSubro> {

  construct(owner : WCWaiverOfSubro) {
    super(owner)
  }
  
  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {WCWaiverOfSubro.Type.TypeInfo.getProperty("State") as IEntityPropertyInfo,
            WCWaiverOfSubro.Type.TypeInfo.getProperty("Type") as IEntityPropertyInfo}
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {WCWaiverOfSubro.Type.TypeInfo.getProperty("ClassCode") as ILinkPropertyInfo,
            WCWaiverOfSubro.Type.TypeInfo.getProperty("WCLine") as ILinkPropertyInfo}
  }

}
