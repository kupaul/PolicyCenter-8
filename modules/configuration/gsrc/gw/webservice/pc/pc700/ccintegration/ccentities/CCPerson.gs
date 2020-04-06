package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.util.Date
uses java.lang.Integer

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCPerson extends CCContact
{
  var _cellPhone : String as CellPhone
  var _dateOfBirth : Date as DateOfBirth
  var _employer : CCCompany as Employer
  var _firstName : String as FirstName
  var _formerName : String as FormerName
  var _gender : String as Gender
  var _guardian : CCPerson as Guardian
  var _lastName : String as LastName
  var _licenseNumber : String as LicenseNumber
  var _licenseState : String as LicenseState
  var _maritalStatus : String as MaritalStatus
  var _middleName : String as MiddleName
  var _numDependents : Integer as NumDependents
  var _numDependentsU18 : Integer as NumDependentsU18
  var _numDependentsU25 : Integer as NumDependentsU25
  var _occupation : String as Occupation
  var _prefix : String as Prefix
  var _suffix : String as Suffix
  var _taxFilingStatus : String as TaxFilingStatus
  var _wards : CCPerson[] as Wards

  construct()
  {
  }
}
