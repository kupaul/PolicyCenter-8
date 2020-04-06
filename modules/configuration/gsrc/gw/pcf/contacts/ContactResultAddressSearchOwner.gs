package gw.pcf.contacts

uses gw.api.address.AddressFillableExtension
uses java.lang.UnsupportedOperationException
uses java.util.Set
uses gw.api.address.AddressOwnerFieldId

@Export
class ContactResultAddressSearchOwner extends OptionalSelectedCountryAddressOwner {

  var _address : Address
  var _useCounty : boolean

  construct(addrDelegate : AddressFillableExtension) {
    assignDelegateInternal(addrDelegate)
  }

  //prevents overridable function being called inside constructor
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

  override function isEditable(fieldId : AddressOwnerFieldId) : boolean {
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
    hFields.remove(AddressOwnerFieldId.STATE)
    // jira(PC-22542)
    // For search we don't want the CEDEX fields so we remove postal code singularly instead of using POSTAL_CODE_FIELDS
    hFields.remove(AddressOwnerFieldId.POSTALCODE)
    hFields.remove(AddressOwnerFieldId.COUNTRY)
    return hFields
  }
}
