package gw.webservice.pc.pc700.ccintegration.ccentities

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCVehicleOwner
{
  var _lienholder : CCContact as Lienholder

  // typekey
  var _ownerType : String as OwnerType

  construct()
  {
  }
}
