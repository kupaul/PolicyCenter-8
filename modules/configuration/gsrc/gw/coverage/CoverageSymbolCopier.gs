package gw.coverage
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class CoverageSymbolCopier extends AbstractEffDatedCopyable<CoverageSymbol> {

  construct(covSymbol : CoverageSymbol) {
    super(covSymbol)
  }

  override function copyBasicFieldsFromBean(covSymbol : CoverageSymbol) {
    this._bean.Description = covSymbol.Description
  }

}
