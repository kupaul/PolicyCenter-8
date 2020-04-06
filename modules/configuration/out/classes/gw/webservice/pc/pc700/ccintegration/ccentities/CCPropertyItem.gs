package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.math.BigDecimal

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCPropertyItem
{
  var _PolicySystemID : String as PolicySystemID
  var _appraisedValue : BigDecimal as AppraisedValue
  var _description : String as Description

  construct()
  {
  }
}
