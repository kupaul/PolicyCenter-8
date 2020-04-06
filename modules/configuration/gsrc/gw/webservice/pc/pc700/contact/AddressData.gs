package gw.webservice.pc.pc700.contact

uses java.util.Date

@gw.xml.ws.annotation.WsiExportable( "http://guidewire.com/pc/ws/gw/webservice/pc/pc700/contact/AddressData" )
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.contact.AddressData instead")
final class AddressData {

  var _addressLine1 : String as AddressLine1
  var _addressLine2 : String as AddressLine2
  var _addressLine3 : String as AddressLine3
  var _city : String as City
  var _state : State as State
  var _postalCode : String as PostalCode
  var _country : Country as Country
  var _county : String as County
  var _addressType : AddressType as AddressType
  var _description : String as Description
  var _validUntil : Date as ValidUntil

    construct() {
    }

  private construct(address : Address) {
    _addressLine1   = address.AddressLine1
    _addressLine2   = address.AddressLine2
    _addressLine3   = address.AddressLine3
    _city           = address.City
    _state          = address.State
    _postalCode     = address.PostalCode
    _country        = address.Country
    _county         = address.County
    _addressType    = address.AddressType
    _description    = address.Description
    _validUntil     = address.ValidUntil
  }

  static function of(address : Address) : AddressData {
    return new AddressData(address)
  }

  override public function toString() : String {
    return "AddressData("
    + "AddressLine1=${AddressLine1}"
    + ", AddressLine2=${AddressLine2}"
    + ", AddressLine3=${AddressLine3}"
    + ", City=${City}"
    + ", State=${State}"
    + ", PostalCode=${PostalCode}"
    + ", Country=${Country}"
    + ", County=${County}"
    + ", AddressType=${AddressType}"
    + ", Description=${Description}"
    + ", ValidUntil=${ValidUntil}"
    + ")"
  }

}
