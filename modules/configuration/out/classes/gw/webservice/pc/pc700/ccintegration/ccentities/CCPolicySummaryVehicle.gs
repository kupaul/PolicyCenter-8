package gw.webservice.pc.pc700.ccintegration.ccentities

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCPolicySummaryVehicle
{
  var _vehicleNumber : int as VehicleNumber
  var _licencePlate : String as LicensePlate
  var _state : String as State  // License plate state
  var _make : String as Make
  var _model : String as Model
  var _color : String as Color
  var _vin : String as Vin
  var _serialNumber : String as SerialNumber  // used by CC for vehicles (such as boats) where there is no VIN
  var _PolicySystemID : String as PolicySystemID

  construct()
  {
  }
}
