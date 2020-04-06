package gw.reinsurance
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class PolicyRiskCopier extends AbstractEffDatedCopyable<PolicyRisk> {

  construct(risk : PolicyRisk) {
    super(risk)
  }

  override function copyBasicFieldsFromBean(policyRisk : PolicyRisk) {
    _bean.TotalInsuredValue = policyRisk.TotalInsuredValue
  }

}
