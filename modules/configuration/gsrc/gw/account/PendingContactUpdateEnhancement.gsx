package gw.account

uses entity.Person
uses entity.Company
uses gw.api.util.StateJurisdictionMappingUtil

enhancement PendingContactUpdateEnhancement : entity.PendingContactUpdate {
  
  function applyUpdateToAccountEntity(){
    var target = this.TargetContact
    var update = this
    target.refresh()
    if (target.Retired){
      return
    }
    
    if (target typeis Person){
      if (update.FirstName != null or update.FirstNameIsNull){
        target.FirstName = update.FirstName
      }
      if (update.Particle != null or update.ParticleIsNull){
        target.Particle = update.Particle
      }
      if (update.LastName != null or update.LastNameIsNull){
        target.LastName = update.LastName
      }
      if (update.FirstNameKanji != null or update.FirstNameKanjiIsNull){
        target.FirstNameKanji = update.FirstNameKanji
      }
      if (update.LastNameKanji != null or update.LastNameKanjiIsNull){
        target.LastNameKanji = update.LastNameKanji
      }
      if (update.LicenseNumber != null or update.LicenseNumberIsNull){
        target.LicenseNumber = update.LicenseNumber
      }
      if (update.LicenseState != null or update.LicenseStateIsNull){
        target.LicenseState = update.LicenseState
      }
      if (update.DateOfBirth != null or update.DateOfBirthIsNull){
        target.DateOfBirth = update.DateOfBirth
      }
      if (update.MaritalStatus != null or update.MaritalStatusIsNull){
        target.MaritalStatus = update.MaritalStatus
      }
    } else if (target typeis Company){
      if (update.CompanyName != null or update.CompanyNameIsNull){
        target.Name = update.CompanyName 
      }
      if (update.CompanyNameKanji != null or update.CompanyNameKanjiIsNull){
        target.NameKanji = update.CompanyNameKanji
      }
    }
  }
  
}
