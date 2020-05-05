package search

uses gw.xml.ws.annotation.WsiExportable
uses java.util.ArrayList

@WsiExportable
final class ContactInfo {


  construct()
  {}
  var _contactFirstName : String as ContactFirstName
  var _contactLastName : String as ContactLastName
  var _ccDOB : String as DateOfBirth
  var _ccmaritalStatus : String as MaritalStatus
  var _ccPrimaryPhone : String as PrimaryPhone
  var _ccHomePhone : String as HomePhone
  var _ccWorkPhone : String as WorkPhone
  var _CCMobilePhone : String as MobilePhone
  var _ccPrimaryEmail : String as PrimaryEmail
  var _ccAddress : String as Address
  var _ccAddressType : String as AddressType
  var _ccLicense : String as License
  var _ccLicenseState : String as LicenseState
  var _ccPreferredCurrency : String as PreferredCurrency
  var _cOfficialSSNID : String as SSNOfficialID


}