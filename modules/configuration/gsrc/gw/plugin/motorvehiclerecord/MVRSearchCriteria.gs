package gw.plugin.motorvehiclerecord
uses java.io.Serializable
uses java.util.Date
uses gw.api.motorvehiclerecord.IMVRSearchCriteria

@Export
class MVRSearchCriteria implements IMVRSearchCriteria, Serializable{

  private var _policyDriverPublicID : String as PolicyDriverPublicID
  private var _licenseNumber : String as LicenseNumber
  private var _firstName : String as FirstName
  private var _middleName : String as MiddleName
  private var _lastName : String as LastName
  private var _dateOfBirth : Date as DateOfBirth
  private var _licenseState : State as LicenseState

  construct() {
    
  }

  construct( policyDriverPublicIDParam : String, licenseNumberParam : String, firstNameParam : String, lastNameParam : String, dateOfBirthParam : Date )
  {
    this.PolicyDriverPublicID = policyDriverPublicIDParam
    this.LicenseNumber = licenseNumberParam
    this.FirstName = firstNameParam
    this.LastName = lastNameParam
    this.DateOfBirth = dateOfBirthParam

  }

  construct( policyDriverPublicIDParam : String, licenseNumberParam : String, firstNameParam : String, middleNameParam : String, lastNameParam : String, dateOfBirthParam : Date, licenseStateParam : State )
  {
    this.PolicyDriverPublicID = policyDriverPublicIDParam
    this.LicenseNumber = licenseNumberParam
    this.FirstName = firstNameParam
    this.MiddleName = middleNameParam
    this.LastName = lastNameParam
    this.DateOfBirth = dateOfBirthParam
    this.LicenseState = licenseStateParam

  }
}
