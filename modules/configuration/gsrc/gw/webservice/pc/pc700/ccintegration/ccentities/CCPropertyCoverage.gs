package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.math.BigDecimal

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCPropertyCoverage extends CCRUCoverage
{
  var _coinsurance : BigDecimal as Coinsurance

  // typekey
  var _coverageBasis : String as CoverageBasis

  construct()
  {
  }
}
