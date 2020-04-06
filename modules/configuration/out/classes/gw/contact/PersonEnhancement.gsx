package gw.contact

uses gw.api.util.StateJurisdictionMappingUtil

enhancement PersonEnhancement : entity.Person {
  /**
   * This person's age.
   */
  property get Age() : int {
    return AgeCalculator.Instance.getAge(this.DateOfBirth)
  }

  function getMVRSearchCriteria() : gw.plugin.motorvehiclerecord.MVRSearchCriteria {
    var mvrSearchCrieria = new gw.plugin.motorvehiclerecord.MVRSearchCriteria()
    
    mvrSearchCrieria.DateOfBirth = this.DateOfBirth
    mvrSearchCrieria.LicenseNumber = this.LicenseNumber
    mvrSearchCrieria.FirstName = this.FirstName
    mvrSearchCrieria.MiddleName = this.MiddleName
    mvrSearchCrieria.LastName = this.LastName
    mvrSearchCrieria.LicenseState = StateJurisdictionMappingUtil.getStateMappingForJurisdiction(this.LicenseState)

    return mvrSearchCrieria
  }
  
}
