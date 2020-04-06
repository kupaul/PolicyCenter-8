package gw.webservice.pc.pc700.ccintegration.ccentities

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCCompany extends CCContact
{
  var _case : CCContact[] as Caze
  var _employees : CCPerson[] as Employees
  var _thirdpartyinsured : CCContact[] as Thirdpartyinsured

  construct()
  {
  }
}
