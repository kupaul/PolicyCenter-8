package gw.webservice.pc.pc700.ccintegration.ccentities

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCStatCode
{
  var _buildingNumber : String as BuildingNumber
  var _classCode : String as ClassCode
  var _linenumber : int as LineNumber
  var _notes : String as Notes
  var _vehicleNumber : String as VehicleNumber

  // typekeys in cc
  var _insLine : String as InsuranceLine
  var _insSubLine : String as InsuranceSubLine
  var _majorPeril : String as MajorPeril
  var _state : String as State

  construct()
  {
  }
}
