package gw.coverage

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

@Export
class CoverageSymbolMatcher extends AbstractEffDatedPropertiesMatcher<CoverageSymbol> {

  construct(covSymbol : CoverageSymbol) {
    super(covSymbol)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {CoverageSymbol.Type.TypeInfo.getProperty("PatternCode") as IEntityPropertyInfo}
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {CoverageSymbol.Type.TypeInfo.getProperty("CoverageSymbolGroup") as ILinkPropertyInfo}
  }

}
