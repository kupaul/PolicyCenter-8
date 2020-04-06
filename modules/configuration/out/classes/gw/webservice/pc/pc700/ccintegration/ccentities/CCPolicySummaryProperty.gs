package gw.webservice.pc.pc700.ccintegration.ccentities

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCPolicySummaryProperty
{
  var _propertyNumber : int as PropertyNumber
  var _buildingNumber : String as BuildingNumber
  var _location : String as Location
  var _notes : String as Notes
  var _address : String as Address
  var _city : String as City
  var _PolicySystemID : String as PolicySystemID
  var _description : String as Description

  construct()
  {
  }
}
