package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.util.Date

@gw.xml.ws.annotation.WsiExportable( "http://guidewire.com/pc/ws/gw/webservice/pc/pc700/ccintegration/ccentities/CCAddress" )
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
final class CCAddress
{
  var _AddressBookUID : String as AddressBookUID
  var _addressLine1 : String as AddressLine1
  var _addressLine2 : String as AddressLine2
  var _addressLine3 : String as AddressLine3
  var _addressType : String as AddressType
  var _city : String as City
  var _country : String as Country
  var _county : String as County
  var _description : String as Description
  var _postalCode : String as PostalCode
  var _state : String as State
  var _validUntil : Date as ValidUntil

  construct()
  {
  }

}
