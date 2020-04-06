package gw.coverage

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo

uses java.lang.Iterable

@Export
class CoverageSymbolGroupMatcher extends AbstractEffDatedPropertiesMatcher<CoverageSymbolGroup> {

  construct(covSymbolGroup : CoverageSymbolGroup) {
    super(covSymbolGroup)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {CoverageSymbolGroup.Type.TypeInfo.getProperty("PatternCode") as IEntityPropertyInfo}
  }

}
