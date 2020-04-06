package gw.lob.pa
uses gw.api.copy.Copier

/**
 * Copies a AddlInterestDetail into a PersonalVehicle.
 */
@Export
class AddlInterestDetailsCopier extends Copier<PersonalVehicle>{

  var _sourceInterestDetail : AddlInterestDetail

  construct(sourceInterestDetail : AddlInterestDetail) {
    _sourceInterestDetail = sourceInterestDetail
  }
  

  override property get Source() : AddlInterestDetail {
    return _sourceInterestDetail
  }

  override function copy(targetVehicle : PersonalVehicle) {
    var additionalInterestDetail : AddlInterestDetail
    var matches = Source.findMatchesInPeriodUntyped(targetVehicle.Branch, false)
    var match = matches.firstWhere(\ m -> m.EffectiveDateRange.includes(targetVehicle.Branch.EditEffectiveDate))
    if (match == null){
      additionalInterestDetail = targetVehicle.addAdditionalInterestDetail(Source.PolicyAddlInterest.AccountContactRole.AccountContact.Contact)
      additionalInterestDetail.copyFromBeanUntyped(Source)
    }
  }
}
