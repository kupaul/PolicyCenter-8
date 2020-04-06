package gw.pcf.contacts

uses gw.api.address.AddressOwnerBase
uses gw.api.address.AddressFillableExtension
uses gw.api.address.AddressOwnerFieldId

uses java.lang.UnsupportedOperationException
uses java.util.Set

@Export
class AddressCountryCityStatePostalCodeOwner extends AddressOwnerBase {

  construct(addrDelegate : AddressFillableExtension) {
    assignDelegateInternal(addrDelegate)
  }

  //prevents overridable method from being called inside constructor
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
    hFields.remove(AddressOwnerFieldId.COUNTRY)
    hFields.removeAll(AddressOwnerFieldId.CITY_FIELDS)
    hFields.remove(AddressOwnerFieldId.STATE)
    hFields.remove(AddressOwnerFieldId.POSTALCODE)
    return hFields
  }
}
