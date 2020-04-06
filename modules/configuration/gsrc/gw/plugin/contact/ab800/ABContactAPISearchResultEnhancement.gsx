package gw.plugin.contact.ab800

uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.types.complex.ABContactAPISearchResult
uses gw.api.util.phone.GWPhoneNumberBuilder
uses gw.api.util.PhoneUtil

enhancement ABContactAPISearchResultEnhancement : ABContactAPISearchResult {

  private function formatPhone(countryCode : PhoneCountryCode, phone : String, extension : String) : String {
    var gwPhone = new GWPhoneNumberBuilder().withCountryCode(countryCode)
        .withNationalNumber(phone).withExtension(extension).build()
    return gwPhone == null ? null : gwPhone.formatWithLocalizedExtension(PhoneUtil.getUserDefaultPhoneCountry())
  }

  property get FaxPhoneValue() : String {
    return formatPhone(this.FaxPhoneCountry, this.FaxPhone, this.FaxPhoneExtension)
  }

  property get CellPhoneValue() : String {
    return formatPhone(this.CellPhoneCountry, this.CellPhone, this.CellPhoneExtension)
  }

  property get HomePhoneValue() : String {
    return formatPhone(this.HomePhoneCountry, this.HomePhone, this.HomePhoneExtension)
  }

  property get WorkPhoneValue() : String {
    return formatPhone(this.WorkPhoneCountry, this.WorkPhone, this.WorkPhoneExtension)
  }

  property get PrimaryPhoneValue() : String {

    if (this.PrimaryPhone == null)
      return null
    if (this.PrimaryPhone == typekey.PrimaryPhoneType.TC_HOME.Code) 
      return this.HomePhoneValue
    if (this.PrimaryPhone == typekey.PrimaryPhoneType.TC_MOBILE.Code)
      return this.CellPhoneValue
    if (this.PrimaryPhone == typekey.PrimaryPhoneType.TC_WORK.Code) 
      return this.WorkPhoneValue
    return null
  }
  
}
