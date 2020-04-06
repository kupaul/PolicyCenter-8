package gw.lob.pa.mvr.crossboundary
uses gw.api.motorvehiclerecord.IMVRIncident
uses java.util.Date
uses java.lang.Integer
uses gw.api.motorvehiclerecord.IMVRData

@Export
class SimpleMVRIncident implements IMVRIncident{

  construct(){
  }

  var _accident : String as Accident
  var _carrierViolationCode  : String as CarrierViolationCode 
  var _convictionDate: Date as ConvictionDate
  var _court: String as Court
  var _description: String as Description
  var _disposition: String as Disposition
  var _eligibleDate: Date as EligibleDate
  var _incidentType: MVRIncidentType as IncidentType
  var _location: String as Location
  var _misc: String as Misc
  var _orderNumber: String as OrderNumber
  var _points: Integer as Points
  var _speed: String as Speed 
  var _speedZone: String as SpeedZone
  var _state: String as State
  var _violationCode : String as ViolationCode 
  var _violationDate: Date as ViolationDate
  var _incidentNumber: Integer as IncidentNumber
  var _mvrDataParent: IMVRData as MVRDataParent

}
