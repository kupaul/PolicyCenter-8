package gw.reinsurance
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class LocationRiskCopier extends AbstractEffDatedCopyable<LocationRisk> {

  construct(locRisk : LocationRisk) {
    super(locRisk)
  }

  override function copyBasicFieldsFromBean(locRisk : LocationRisk) {
    _bean.TotalInsuredValue = locRisk.TotalInsuredValue
  }

}
