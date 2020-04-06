package gw.lob.im

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link IMLocation}s based on the FK to the {@link PolicyLocation}.
 */
@Export
class IMLocationMatcher extends AbstractEffDatedPropertiesMatcher<IMLocation> {

  construct(loc : IMLocation) {
    super(loc)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {}
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {IMLocation.Type.TypeInfo.getProperty("Location") as ILinkPropertyInfo}
  }

}
