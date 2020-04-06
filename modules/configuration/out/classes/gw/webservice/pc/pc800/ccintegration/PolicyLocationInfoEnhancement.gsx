package gw.webservice.pc.pc800.ccintegration

uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCAddress
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.MapEntry
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.PolicyLocationInfo_TotalInsuredValues
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.PolicyLocationInfo
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.PolicyLocationInfo_PNIAddressFields

enhancement PolicyLocationInfoEnhancement: PolicyLocationInfo {

  /**
   * Populates this PolicyLocationInfo with details from the given policyLocation.
   */
  function configure(pl: PolicyLocation) {
    this.PolicyNumber = pl.Branch.PolicyNumber
    this.ProductCode = pl.Branch.Policy.ProductCode
    this.PolicyLocationLatitude = pl.AccountLocation.Latitude as String
    this.PolicyLocationLongitude = pl.AccountLocation.Longitude as String
    this.PolicyLocationGeocodeStatus = pl.AccountLocation.GeocodeStatus.Code
    this.PolicyLocationPolicySystemID = pl.TypeIDString

    var primaryNamedInsured = pl.Branch.PrimaryNamedInsured
    var primaryNamedInsuredContact = primaryNamedInsured.AccountContactRole.AccountContact.Contact
    this.PNIName = primaryNamedInsured.DisplayName
    this.PNIPhoneCountry = primaryNamedInsuredContact.WorkPhoneCountry.Code
    this.PNIPhoneNumber = primaryNamedInsuredContact.WorkPhone
    this.PNIPhoneExtension = primaryNamedInsuredContact.WorkPhoneExtension
    this.PNIEmail = primaryNamedInsuredContact.EmailAddress1

    var pniAddressFields = new CCAddress()
    pniAddressFields.configure(pl.Branch.PolicyAddress)
    this.PNIAddressFields = new (pniAddressFields)  // let 'new' infer the type since the PNIAddressFields has a long xsd type name

    var policyLocationAddress = new CCAddress()
    policyLocationAddress.configure(pl)
    this.PolicyLocationAddress = new (policyLocationAddress)  // let 'new' infer the type since the PolicyLocationAddress has a long xsd type name

    for (reinsurable in pl.LocationRisks) {
      this.TotalInsuredValues.add(new PolicyLocationInfo_TotalInsuredValues(new MapEntry() {
        :Name = reinsurable.CoverageGroup.Code,
        :Value = reinsurable.TotalInsuredValue.Amount,
        :Currency = reinsurable.TotalInsuredValue.Currency as String
    }))
  }
 }

}
