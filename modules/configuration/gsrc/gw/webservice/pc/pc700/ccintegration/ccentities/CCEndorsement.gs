package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.util.Date

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCEndorsement
{
  var _PolicySystemID : String as PolicySystemID
  var _comments : String as Comments
  var _description : String as Description
  var _effDate : Date as EffectiveDate
  var _expDate : Date as ExpirationDate
  var _formNumber : String as FormNumber

  construct()
  {
  }
}
