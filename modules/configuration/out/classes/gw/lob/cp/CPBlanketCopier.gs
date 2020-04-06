package gw.lob.cp
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class CPBlanketCopier extends AbstractEffDatedCopyable<CPBlanket> {

  construct(blanket : CPBlanket) {
    super(blanket)
  }

  override function copyBasicFieldsFromBean(blanket : CPBlanket) {
    this._bean.CPBlanketDescription = blanket.CPBlanketDescription
  }

}
