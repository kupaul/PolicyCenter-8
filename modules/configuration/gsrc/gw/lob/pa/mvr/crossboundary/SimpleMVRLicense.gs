package gw.lob.pa.mvr.crossboundary
uses gw.api.motorvehiclerecord.IMVRLicense
uses java.util.Date
uses java.lang.Integer
uses gw.api.motorvehiclerecord.IMVRData

@Export
class SimpleMVRLicense implements IMVRLicense{

  construct() {

  }

  var _primaryLicense : Boolean as PrimaryLicense
  var _licenseNumber : String as LicenseNumber
  var _licenseState : State as LicenseState
  var _licenseClass : String as LicenseClass
  var _originallyIssued : Date as OriginallyIssued
  var _issuedDate : Date as IssuedDate
  var _expireDate : Date as ExpireDate
  var _licenseType : String as LicenseType
  var _licenseStatus : String as LicenseStatus
  var _restrictions : String as Restrictions
  var _endorsements : String as Endorsements
  var _points : Integer as Points
  var _reinstateDate : Date as ReinstateDate
  var _nonResidentMilitary : Boolean as NonResidentMilitary
  var _boatClass : String as BoatClass
  var _mvrDataParent: IMVRData as MVRDataParent

}
