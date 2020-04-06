package gw.lob.cp

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link CPLocation}s based on the FK to {@link PolicyLocation}.
 */
@Export
class CPLocationMatcher extends AbstractEffDatedPropertiesMatcher<CPLocation> {

  construct(loc : CPLocation) {
    super(loc)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {}
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {CPLocation.Type.TypeInfo.getProperty("Location") as ILinkPropertyInfo};
  }

}
