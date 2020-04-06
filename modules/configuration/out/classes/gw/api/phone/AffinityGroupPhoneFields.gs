package gw.api.phone

uses gw.api.util.PhoneUtil

@Export
class AffinityGroupPhoneFields extends BasePhoneFields {

  var _affinityGroup : AffinityGroup

  construct(affinityGroup : AffinityGroup) {
    _affinityGroup = affinityGroup
    setDefaultPhoneCountry()
  }

  override property get CountryCode(): typekey.PhoneCountryCode {
    return _affinityGroup.PrimaryContactPhoneCountryCode
  }

  override property set CountryCode(value: typekey.PhoneCountryCode) {
    _affinityGroup.PrimaryContactPhoneCountryCode = value
  }

  override property get NationalSubscriberNumber(): java.lang.String {
    return _affinityGroup.PrimaryContactPhone
  }

  override property set NationalSubscriberNumber(value: java.lang.String) {
    _affinityGroup.PrimaryContactPhone = value
  }

  override property get Extension(): java.lang.String {
    return _affinityGroup.PrimaryContactPhoneExtension
  }

  override property set Extension(value: java.lang.String) {
    _affinityGroup.PrimaryContactPhoneExtension = value
  }

  private function setDefaultPhoneCountry () {
    if (CountryCode == null) {
      CountryCode = PhoneUtil.getUserDefaultPhoneCountry();
    }
  }
}