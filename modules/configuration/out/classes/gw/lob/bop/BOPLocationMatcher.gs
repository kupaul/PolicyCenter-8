package gw.lob.bop

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link BOPLocation} based on the FK to {@link AccountLocation}.
 */
@Export
class BOPLocationMatcher extends AbstractEffDatedPropertiesMatcher<BOPLocation> {

  construct(location : BOPLocation) {
    super(location)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {}
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {BOPLocation.Type.TypeInfo.getProperty("Location") as ILinkPropertyInfo};
  }

}
