package gw.webservice.pc.pc700.ccintegration.ccentities

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCVehicleRU extends CCRiskUnit
{
  var _vehicle : CCVehicle as Vehicle
  var _vehicleLocation : CCPolicyLocation as VehicleLocation

  construct()
  {
  }
}
