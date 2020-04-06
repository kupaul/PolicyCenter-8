package gw.api.phone

uses java.lang.UnsupportedOperationException

@Export
abstract class BasePhoneFields implements PhoneFields {

  override property get CountryCode(): typekey.PhoneCountryCode {
    return null
  }

  override property set CountryCode(value: typekey.PhoneCountryCode) {
    throw notSupported("Phone CountryCode")
  }

  override property get NationalSubscriberNumber(): java.lang.String {
    return null
  }

  override property set NationalSubscriberNumber(value: java.lang.String) {
    throw notSupported("Phone Number")
  }

  override property get Extension(): java.lang.String {
    return null
  }

  override property set Extension(value: java.lang.String) {
    throw notSupported("Phone Extension")
  }

  override property get Type(): typekey.PhoneType {
    return null
  }

  override property set Type(value: typekey.PhoneType) {
    throw notSupported("Phone Type")
  }

  private function notSupported(field: String) : UnsupportedOperationException {
    return new UnsupportedOperationException(field + " Field is not supported")
  }
}
