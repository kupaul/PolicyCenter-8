package gw.coverage
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class CoverageSymbolGroupCopier extends AbstractEffDatedCopyable<CoverageSymbolGroup> {

  construct(covSymbolGroup : CoverageSymbolGroup) {
    super(covSymbolGroup)
  }

  override function copyBasicFieldsFromBean(p0 : CoverageSymbolGroup) {
    // nothing to do
  }

}
