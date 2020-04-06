package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.lang.Integer

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCCovTerm
{
  var _PolicySystemID : String as PolicySystemID
  var _covTermOrder : Integer as CovTermOrder
  var _covTermPattern : String as CovTermPattern
  var _aggModel : String as ModelAggregation
  var _resModel : String as ModelRestriction

  construct()
  {
  }
}
