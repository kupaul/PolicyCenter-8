package gw.lob.cp
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class CPLocationEffDatedCopier extends AbstractEffDatedCopyable<CPLocation> {

  construct(loc : CPLocation) {
    super(loc)
  }

  override function copyBasicFieldsFromBean(location : CPLocation) {
    _bean.PrincipalOpsDesc = location.PrincipalOpsDesc
  }
  
  override function copyFromBean(location : CPLocation) {
    copyBasicFieldsFromBean(location)
    _bean.PolicyLocation.copyFromBeanUntyped(location.PolicyLocation)
  }

}
