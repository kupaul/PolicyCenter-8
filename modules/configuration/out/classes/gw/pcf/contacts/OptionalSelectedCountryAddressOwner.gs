package gw.pcf.contacts

uses gw.api.address.AddressCountrySettings
uses gw.lang.Export

uses java.lang.UnsupportedOperationException
uses java.util.Set
uses gw.api.address.AddressOwnerBase
uses gw.api.admin.BaseAdminUtil

@Export
abstract class OptionalSelectedCountryAddressOwner extends AddressOwnerBase {

  // This allows Country to be null
  override property get SelectedCountry() : Country {
    return AddressDelegate.Country
  }

  // When country is null, return the default country settings
  override property get CountrySettings() : AddressCountrySettings {
    return AddressCountrySettings.getSettings(SelectedCountry ?: BaseAdminUtil.getDefaultCountry())
  }

}