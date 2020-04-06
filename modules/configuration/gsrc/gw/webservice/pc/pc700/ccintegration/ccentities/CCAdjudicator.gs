package gw.webservice.pc.pc700.ccintegration.ccentities

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCAdjudicator extends CCPerson
{
  var _adjudicativeDomain : String as AdjudicativeDomain
  var _adjudicatorLicense : String as AdjudicatorLicense

  construct()
  {
  }
}
