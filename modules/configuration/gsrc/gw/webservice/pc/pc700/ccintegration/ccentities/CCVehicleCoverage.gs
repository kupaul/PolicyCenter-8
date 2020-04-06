package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.math.BigDecimal

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCVehicleCoverage extends CCRUCoverage
{
  var _claimAggLimit : BigDecimal as ClaimAggLimit
  var _nonmedAggLimit: BigDecimal as NonmedAggLimit
  var _personAggLimit : BigDecimal as PersonAggLimit
  var _replaceAggLimit : BigDecimal as ReplaceAggLimit

  construct()
  {
  }
}
