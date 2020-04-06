package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.util.Date

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCPolicySummary {
  var _insuredName : String as InsuredName
  var _address : String as Address
  var _city : String as City
  var _postalCode : String as PostalCode
  var _policyNumber : String as PolicyNumber
  var _producerCode : String as ProducerCode
  var _effDate : Date as EffectiveDate
  var _exDate : Date as ExpirationDate
  var _vehicles : CCPolicySummaryVehicle[] as Vehicles
  var _properties : CCPolicySummaryProperty[] as Properties
  var _archived : boolean as IsArchived

  // typelists
  var _state : String as State
  var _policyType : String as PolicyType
  var _status : String as Status

  construct()
  {
  }

}
