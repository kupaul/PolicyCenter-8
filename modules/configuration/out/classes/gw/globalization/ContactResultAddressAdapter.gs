package gw.globalization

uses gw.plugin.contact.ContactResult

/**
 * Adapts a ContactResult to work with AddressFillable-dependent components.
 * ContactResult is read-only so its supported properties throw a different
 * exception message than for its unsupported properties.
 */
@Export
class ContactResultAddressAdapter extends UnsupportedAddressFillable {

  var _contactResult : ContactResult
  var _readonlyBehavior = new UnsupportedPropertyBehavior(this.IntrinsicType, UnsupportedPropertyBehavior.READONLY_MESSAGE_FORMAT)

  construct(searchCriteria : ContactResult) {
     _contactResult = searchCriteria
  }

  override property get AddressLine1() : String {
    return _contactResult.PrimaryAddressLine1
  }
  override property set AddressLine1(arg : String) {
    _readonlyBehavior.setValue("AddressLine1")
  }

  override property get AddressLine2() : String {
    return _contactResult.PrimaryAddressLine2
  }
  override property set AddressLine2(arg : String) {
    _readonlyBehavior.setValue("AddressLine2")
  }

  override property get AddressLine3() : String {
    return _contactResult.PrimaryAddressLine3
  }
  override property set AddressLine3(arg : String) {
    _readonlyBehavior.setValue("AddressLine3")
  }

  override property get City() : String {
    return _contactResult.PrimaryAddressCity
  }
  override property set City(arg : String) {
    _readonlyBehavior.setValue("City")
  }

  override property get Country() : Country {
    return _contactResult.PrimaryAddressCountry
  }
  override property set Country(arg : Country) {
    _readonlyBehavior.setValue("Country")
  }

  override property get County() : String {
    return _contactResult.PrimaryAddressCounty
  }
  override property set County(arg : String) {
    _readonlyBehavior.setValue("County")
  }

  override property get PostalCode() : String {
    return _contactResult.PrimaryAddressPostalCode
  }
  override property set PostalCode(arg : String) {
    _readonlyBehavior.setValue("PostalCode")
  }

  override property get State(): State {
    return _contactResult.PrimaryAddressState
  }
  override property set State(arg : State) {
    _readonlyBehavior.setValue("State")
  }

}
