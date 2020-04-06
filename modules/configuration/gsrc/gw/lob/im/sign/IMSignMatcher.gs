package gw.lob.im.sign

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link IMSign}s based on the FK to the {@link IMLocation} as well as the
 * Description, Interior and SignType.
 */
@Export
class IMSignMatcher extends AbstractEffDatedPropertiesMatcher<IMSign> {
  
  construct(owner : IMSign) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {
      IMSign.Type.TypeInfo.getProperty("Description") as IEntityPropertyInfo,
      IMSign.Type.TypeInfo.getProperty("Interior") as IEntityPropertyInfo,
      IMSign.Type.TypeInfo.getProperty("SignType") as IEntityPropertyInfo
    }
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {IMSign.Type.TypeInfo.getProperty("IMLocation") as ILinkPropertyInfo}
  }
  
}
