package gw.webservice.pc.pc800.contact

uses java.util.Date

@gw.xml.ws.annotation.WsiExportable( "http://guidewire.com/pc/ws/gw/webservice/pc/pc800/contact/AddressData" )
@Export
final class AddressData {

  var _addressLine1      : String as AddressLine1
  var _addressLine1Kanji : String as AddressLine1Kanji
  var _addressLine2      : String as AddressLine2
  var _addressLine2Kanji : String as AddressLine2Kanji
  var _addressLine3      : String as AddressLine3
  var _city              : String as City
  var _cityKanji         : String as CityKanji
  var _state             : State as State
  var _postalCode        : String as PostalCode
  var _country           : Country as Country
  var _county            : String as County
  var _addressType       : AddressType as AddressType
  var _description       : String as Description
  var _validUntil        : Date as ValidUntil
  var _cedex             : Boolean as CEDEX
  var _cedexBureau       : String as CEDEXBureau

    construct() {
    }
    
  private construct(address : Address) {
    _addressLine1      = address.AddressLine1
    _addressLine1Kanji = address.AddressLine1Kanji
    _addressLine2      = address.AddressLine2
    _addressLine2Kanji = address.AddressLine2Kanji
    _addressLine3      = address.AddressLine3
    _city              = address.City
    _cityKanji         = address.CityKanji
    _state             = address.State
    _postalCode        = address.PostalCode
    _country           = address.Country
    _county            = address.County
    _addressType       = address.AddressType
    _description       = address.Description
    _validUntil        = address.ValidUntil
    _cedex             = address.CEDEX
    _cedexBureau       = address.CEDEXBureau
  }

  static function of(address : Address) : AddressData {
    return new AddressData(address)
  }

  override public function toString() : String {
    return "AddressData("
    + "AddressLine1=${AddressLine1}"
    + ", AddressLine1Kanji=${AddressLine1Kanji}"
    + ", AddressLine2=${AddressLine2}"
    + ", AddressLine2Kanji=${AddressLine2Kanji}"
    + ", AddressLine3=${AddressLine3}"
    + ", City=${City}"
    + ", CityKanji=${CityKanji}"
    + ", State=${State}"
    + ", PostalCode=${PostalCode}"
    + ", Country=${Country}"
    + ", County=${County}"
    + ", AddressType=${AddressType}"
    + ", Description=${Description}"
    + ", ValidUntil=${ValidUntil}"
    + ", CEDEX=${CEDEX}"
    + ", CEDEXBureau=${CEDEXBureau}"
    + ")"
  }
  
}
