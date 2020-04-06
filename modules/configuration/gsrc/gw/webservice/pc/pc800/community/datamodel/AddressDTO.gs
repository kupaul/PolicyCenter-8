package gw.webservice.pc.pc800.community.datamodel

uses gw.xml.ws.annotation.WsiExportable

@Export
@WsiExportable("http://guidewire.com/pc/ws/gw/webservice/pc/pc800/community/datamodel/AddressDTO")

// After making changes to this file you will want to do a "pc gen-wsi-local" to create the wsdl
final class AddressDTO {

  var _addressLine1 : String as AddressLine1
  var _addressLine2 : String as AddressLine2
  var _addressLine3 : String as AddressLine3
  var _city : String as City
  var _county : String as County
  var _description : String as Description
  var _postalCode : String as PostalCode
  var _publicID : String as PublicID

  var _addressType : AddressType as AddressType
  var _state : State as State
  var _country : Country as Country

  var _addressLine1Kanji : String as AddressLine1Kanji
  var _addressLine2Kanji : String as AddressLine2Kanji
  var _cityKanji : String as CityKanji
  var _CEDEX : boolean as CEDEX
  var _CEDEXBureau : String as CEDEXBureau
}