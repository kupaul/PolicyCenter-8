package gw.pcf.contacts

uses gw.api.address.AddressFillableExtension
uses gw.api.address.AddressOwnerFieldId
uses java.lang.UnsupportedOperationException
uses java.util.Set

@Export
class AccountAddressSearchOwner extends OptionalSelectedCountryAddressOwner {

  var _address : Address
  var _useCounty : boolean

  construct(addrDelegate : AddressFillableExtension, useCounty : boolean = true) {
    this.assignDelegateInternal(addrDelegate)
    _useCounty = useCounty
  }

  //prevents calling overridable function from constructor
  private function assignDelegateInternal(addrDelegate : AddressFillableExtension) {
    this.setDelegateInternal(addrDelegate)
  }

  override property get ShowAddressSummary() : boolean {
    return false
  }

  override property get Address(): entity.Address {
    return null
  }
  override property set Address(value: entity.Address) {
    throw new UnsupportedOperationException("Address is not supported, please use AddressFillableExtension")
  }

  override function isHideIfReadOnly(fieldId : AddressOwnerFieldId) : boolean {
    return false
  }

  override property get RequiredFields() : Set <AddressOwnerFieldId> {
    return {}.freeze()
  }

  override property get HiddenFields() : Set <AddressOwnerFieldId> {
    var hFields : Set <AddressOwnerFieldId> = {}
    hFields.addAll(AddressOwnerFieldId.ALL_PCF_FIELDS)
    hFields.removeAll(AddressOwnerFieldId.ADDRESSLINE1_FIELDS)
    hFields.removeAll(AddressOwnerFieldId.ADDRESSLINE2_FIELDS)
    hFields.removeAll(AddressOwnerFieldId.CITY_FIELDS)
    if (_useCounty) {
      hFields.remove(AddressOwnerFieldId.COUNTY)
    }
    hFields.remove(AddressOwnerFieldId.STATE)
    // jira(PC-22542)
    // For search we don't want the CEDEX fields so we remove postal code singularly instead of using POSTAL_CODE_FIELDS
    hFields.remove(AddressOwnerFieldId.POSTALCODE)
    hFields.remove(AddressOwnerFieldId.COUNTRY)
    return hFields
  }
}