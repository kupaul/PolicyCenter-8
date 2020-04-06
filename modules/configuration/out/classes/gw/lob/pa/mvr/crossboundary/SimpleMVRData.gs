package gw.lob.pa.mvr.crossboundary
uses java.util.Date
uses gw.api.motorvehiclerecord.IMVRIncident
uses gw.api.motorvehiclerecord.IMVROrder
uses java.lang.Integer
uses java.util.ArrayList
uses gw.api.motorvehiclerecord.IMVRSearchCriteria
uses gw.api.motorvehiclerecord.IMVRLicense
uses gw.api.motorvehiclerecord.IMVRData

@Export
class SimpleMVRData implements IMVRData{

  construct(){
    resetIncidents()
    resetLicenses()
  }

  var _additionalDrivers : String as AdditionalDrivers
  var _address : String as Address
  var _dateOfBirth : Date as DateOfBirth
  var _donor : Boolean as Donor
  var _eyes : String as Eyes
  var _firstName : String as FirstName
  var _gender : GenderType as Gender
  var _hair : String as Hair
  var _height : String as Height
  var _lastName : String as LastName
  var _middleName : String as MiddleName
  var _miscellaneous : String as Miscellaneous
  var _race : String as Race
  var _reportDate : Date as ReportDate
  var _reportNumber : Integer as ReportNumber
  var _ssn : String as SSN
  var _weight : String as Weight
  var _yearsRequested : Integer as YearsRequested
  var _mvrOrderParent: IMVROrder as MVROrderParent
  var _incidents : List<IMVRIncident>
  var _licenses : List<IMVRLicense>
  
  override property get Incidents() : IMVRIncident[] {
    return _incidents.toTypedArray()
  }

  override property get Licenses() : IMVRLicense[] {
    return _licenses.toTypedArray()
  }
  
  final function resetIncidents(){
    _incidents = new ArrayList<IMVRIncident>()  
  }
  
  function addIncident(incident : IMVRIncident){
    _incidents.add(incident)
    if(incident typeis SimpleMVRIncident){
      incident.MVRDataParent = this
    }
  }
  
  final function resetLicenses(){
    _licenses = new ArrayList<IMVRLicense>()  
  }
  
  function addLicense(license : IMVRLicense){
    _licenses.add(license)  
    if(license typeis SimpleMVRLicense){
      license.MVRDataParent = this
    }
  }
  
  function setDataBasedOnSearchCriteria(msc : IMVRSearchCriteria){     
    this._firstName = msc.FirstName
    this._lastName = msc.LastName
    this._middleName = msc.MiddleName
    this._dateOfBirth = msc.DateOfBirth
  }

}
