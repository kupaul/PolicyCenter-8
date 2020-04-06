package gw.lob.wc.contact
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class WCLaborContactDetailCopier extends AbstractEffDatedCopyable<WCLaborContactDetail> {

  construct(contactDetail : WCLaborContactDetail) {
    super(contactDetail)
  }

  override function copyBasicFieldsFromBean(detail : WCLaborContactDetail) {
    _bean.WorkLocation = detail.WorkLocation
    _bean.DescriptionOfDuties = detail.DescriptionOfDuties
    _bean.NumberOfEmployees = detail.NumberOfEmployees
    _bean.ContractExpirationDate = detail.ContractExpirationDate
  }

}
