package gw.webservice.pc.pc700.ccintegration.ccentities

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCOfficialID
{
  var _officialIDInsuredAndType : String as OfficialIDInsuredAndType
  var _officialIDType : String as OfficialIDType
  var _officialIDValue : String as OfficialIDValue
  var _state : String as State

  construct()
  {
  }
}
