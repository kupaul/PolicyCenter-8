package gw.contact
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class PolicyAddlInsuredDetailCopier extends AbstractEffDatedCopyable<PolicyAddlInsuredDetail> {

  construct(insuredDetail : PolicyAddlInsuredDetail) {
    super(insuredDetail)
  }

  override function copyBasicFieldsFromBean(p0 : PolicyAddlInsuredDetail) {
    //nothing to do
  }

}
