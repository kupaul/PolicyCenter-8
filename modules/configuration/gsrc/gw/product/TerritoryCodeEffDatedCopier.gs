package gw.product
uses gw.api.copier.AbstractEffDatedCopyable


@Export
class TerritoryCodeEffDatedCopier extends AbstractEffDatedCopyable<TerritoryCode> {

  construct(code : TerritoryCode) {
    super(code)
  }
  
  override public function copyBasicFieldsFromBean(code : TerritoryCode) {
    _bean.PolicyLinePattern = code.PolicyLinePattern;
    _bean.Code = code.Code;
  }
}
