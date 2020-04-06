package gw.contact
uses gw.account.ContactToPolicyContactRoleSyncedField
uses gw.account.PersonToPolicyContactRoleSyncedField
uses gw.api.util.DisplayableException
uses gw.api.database.PCBeanFinder

@Export
enhancement PolicyContactRoleEnhancement : PolicyContactRole {

  /**
   * Shared and revisioned company name.
   */
  property get CompanyName() : String {
    return ContactToPolicyContactRoleSyncedField.CompanyName.getValue(this)
  }

  /**
   * Shared and revisioned company name.
   */
  property set CompanyName(arg : String) {
    ContactToPolicyContactRoleSyncedField.CompanyName.setValue(this, arg)
  }

  /**
   * Shared and revisioned company name kanji.
   */
  property get CompanyNameKanji() : String {
    return ContactToPolicyContactRoleSyncedField.CompanyNameKanji.getValue(this)
  }

  /**
   * Shared and revisioned company name kanji.
   */
  property set CompanyNameKanji(arg : String) {
    ContactToPolicyContactRoleSyncedField.CompanyNameKanji.setValue(this, arg)
  }

  /**
   * Shared and revisioned first name.
   */
  property get FirstName() : String {
    return PersonToPolicyContactRoleSyncedField.FirstName.getValue(this)
  }

  /**
   * Shared and revisioned first name.
   */
  property set FirstName(arg : String) {
    PersonToPolicyContactRoleSyncedField.FirstName.setValue(this, arg)
  }

  /**
   * Shared and revisioned particle.
   */
  property get Particle() : String {
    return PersonToPolicyContactRoleSyncedField.Particle.getValue(this)
  }

  /**
   * Shared and revisioned particle.
   */
  property set Particle(arg : String) {
    PersonToPolicyContactRoleSyncedField.Particle.setValue(this, arg)
  }

  /**
   * Shared and revisioned last name.
   */
  property get LastName() : String {
    return PersonToPolicyContactRoleSyncedField.LastName.getValue(this)
  }

  /**
   * Shared and revisioned last name.
   */
  property set LastName(arg : String) {
    PersonToPolicyContactRoleSyncedField.LastName.setValue(this, arg)
  }

  /**
   * Shared and revisioned first name kanji.
   */
  property get FirstNameKanji() : String {
    return PersonToPolicyContactRoleSyncedField.FirstNameKanji.getValue(this)
  }

  /**
   * Shared and revisioned first name Kanji.
   */
  property set FirstNameKanji(arg : String) {
    PersonToPolicyContactRoleSyncedField.FirstNameKanji.setValue(this, arg)
  }

  /**
   * Shared and revisioned last name Kanji.
   */
  property get LastNameKanji() : String {
    return PersonToPolicyContactRoleSyncedField.LastNameKanji.getValue(this)
  }

  /**
   * Shared and revisioned last name Kanji.
   */
  property set LastNameKanji(arg : String) {
    PersonToPolicyContactRoleSyncedField.LastNameKanji.setValue(this, arg)
  }

  /**
   * Shared and revisioned date of birth.
   */
  property get DateOfBirth() : DateTime {
    return PersonToPolicyContactRoleSyncedField.DateOfBirth.getValue(this)
  }
  
  /**
   * Shared and revisioned date of birth.
   */
  property set DateOfBirth(arg : DateTime) {
    PersonToPolicyContactRoleSyncedField.DateOfBirth.setValue(this, arg)
  }
  
  /**
   * Shared and revisioned maritial status.
   */
  property get MaritalStatus() : MaritalStatus {
    return PersonToPolicyContactRoleSyncedField.MaritalStatus.getValue(this)
  }
  
  /**
   * Shared and revisioned maritial status.
   */
  property set MaritalStatus(arg : MaritalStatus) {
    PersonToPolicyContactRoleSyncedField.MaritalStatus.setValue(this, arg)
  }

  function hasSameContactAs(policyContactRole : PolicyContactRole) : boolean {
    return this.AccountContactRole.AccountContact.Contact == policyContactRole.AccountContactRole.AccountContact.Contact
  }

   /**
   * Removes acr, account contact, and contact if they match those in potentialContactMatch
   * Resets acr, account contact and contact if necessary
   */
  function resetContactAndRoles(potentialContactMatch : Contact) {
    var acrToRemove = this.AccountContactRole
    var acctContactToRemove = acrToRemove.AccountContact
    var contactToRemove = acctContactToRemove.Contact

    if (potentialContactMatch != null) { // existing contact that matches the current new contact(referenced by this)      
      var acctContactMatch = this.Branch.Policy.Account.AccountContacts.firstWhere(\ a -> a != acctContactToRemove 
           and a.Contact.AddressBookUID == potentialContactMatch.AddressBookUID)      
      if (acctContactMatch != null) { //existing account contact with same contact as potentialContactMatch        
        var acrMatch = acctContactMatch.Roles.firstWhere(\ a -> a.Subtype.Code == acrToRemove.Subtype.Code)
        if (acrMatch != null) { //such account contact has same role          
          var pcrMatch = this.Branch.PolicyContactRoles.firstWhere(\ p -> p != this and p.AccountContactRole == acrMatch)                 
          if (pcrMatch != null) { //exact same pcr already in this policy period          
            throw new DisplayableException(displaykey.Web.Contact.DuplicatePolicyContactRoleError(this)) // Case 4
          } else { //pcr not yet created in this policy
            this.setFieldValue("AccountContactRole", acrMatch) // Case 3
          }
          acrToRemove.remove()
        } else { // such account contact does not yet have same role
          acctContactMatch.addToRoles(acrToRemove) // Case 2                     
        }    
        this.Branch.Policy.Account.removeFromAccountContacts(acctContactToRemove)
        acctContactToRemove.remove()  
      } else { // no account contact with same contact
        acctContactToRemove.Contact = potentialContactMatch // Case 1
      } 
      potentialContactMatch.copyUIFieldsFromContact(contactToRemove)
      contactToRemove.OfficialIDs.each(\ o -> o.remove())     
      contactToRemove.remove()
    }    
  }

  /**
   * If the newly created contact already exist in PC (potentialContactMatch). Then this function will change
   * the PNI to potentialContactMatch, copy data from the newly created contact to potentialContactMatch since user
   * might modify the contact information from the UI. 
   * resetPrimaryNameInsured does make the call to policy.changePrimaryNamedInsuredTo(), which will cause a series of changes including 
   * policy address, effectiveDateField and denormalizedPrimaryInsuredNamed.. etc. that's why it's handled differently from resetContactAndRoles.
   * 
   * And this function will delete the newly create contact at the end to aviod duplicate contact been created.
   * This function should be only used on newly created contact which is not reference from anywhere else. 
   */

  function resetPrimaryNamedInsured(potentialContactMatch : Contact) {
    
    var currentContact = this.AccountContactRole.AccountContact.Contact
    var currentPNI = this.Branch.PrimaryNamedInsured.AccountContactRole.AccountContact.Contact
    // check to make sure the contact associated to this Policy Contact Role is the primary named insured to this policy period.
    if (currentPNI != currentContact) {
       throw new DisplayableException(displaykey.Web.Contact.Error.ResetPrimaryNamedInsured)
    }
    if (potentialContactMatch == null) {
      this.Branch.changePolicyAddressTo(currentContact.PrimaryAddress)
    } else {  
      potentialContactMatch = this.Bundle.add(PCBeanFinder.loadBeanByPublicID<Contact>(potentialContactMatch.PublicID, Contact))
      if (potentialContactMatch == null) {
        throw new DisplayableException(displaykey.Web.Contact.Error.ResetPrimaryNamedInsured)
      }
      potentialContactMatch.copyUIFieldsFromContact(currentContact)
      this.Branch.changePrimaryNamedInsuredTo(potentialContactMatch)
      
      this.AccountContactRole.remove()
      this.AccountContactRole.AccountContact.remove() 
      if (currentContact.New) {
        currentContact.OfficialIDs.each(\ o -> o.remove())    
        currentContact.remove()
      }
    }
  }
  
}
