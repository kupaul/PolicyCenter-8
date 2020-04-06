package gw.webservice.pc.pc700.ccintegration.ccentities

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCClassificationCovTerm extends CCCovTerm {

  var _code : String as Code          // varchar(100) in CC
  var _desc : String as Description   // varchar(100) in CC

  construct() {
  }

}
