package gw.product

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link TerritoryCode}s based on the FK to the {@link PolicyLocation} as well as the
 * Code property.
 */
@Export
class TerritoryCodeMatcher extends AbstractEffDatedPropertiesMatcher<TerritoryCode> {

  construct(code : TerritoryCode) {
    super(code)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {TerritoryCode.Type.TypeInfo.getProperty("Code") as IEntityPropertyInfo,
            TerritoryCode.Type.TypeInfo.getProperty("PolicyLinePatternCode") as IEntityPropertyInfo}
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {TerritoryCode.Type.TypeInfo.getProperty("PolicyLocation") as ILinkPropertyInfo}
  }

}
