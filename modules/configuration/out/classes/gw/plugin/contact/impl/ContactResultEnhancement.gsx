package gw.plugin.contact.impl

uses gw.api.util.PhoneUtil
uses gw.api.util.phone.GWPhoneNumberBuilder

enhancement ContactResultEnhancement : gw.plugin.contact.ContactResult {

  private function formatPhone(countryCode : PhoneCountryCode, phone : String, extension : String) : String {
    var gwPhone = new GWPhoneNumberBuilder().withCountryCode(PhoneCountryCode.get(countryCode as String))
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
}

