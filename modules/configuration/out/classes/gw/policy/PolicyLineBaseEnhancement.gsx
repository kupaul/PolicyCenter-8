package gw.policy

uses com.guidewire.pl.web.controller.UserDisplayableException
uses gw.plugin.contact.IContactConfigPlugin
uses gw.plugin.Plugins
uses gw.entity.IEntityPropertyInfo
uses java.util.HashMap

enhancement PolicyLineBaseEnhancement : PolicyLine {

  function getAllLocationsInState(state : State) : PolicyLocation[] {
     if(state == null){
       return new PolicyLocation[0]
     }
     return this.Branch.PolicyLocations.where( \ loc -> loc.State == state )
  }

  /**
   * Returns true if there are supplemental question sets that are applicable to this policy line.
   */
  function hasSupplementalQuestions() : boolean{
     return this.Branch.Policy.Product.getAvailableQuestionSetsByType(QuestionSetType.TC_SUPPLEMENTAL, this ).Count > 0
  }

  /**
   * All the existing Active additional insureds on the Account
   * Includes all of them as multiple detail rows are allowed, so it is perfectly valid to include Contacts that are
   * already AdditionalInsureds on this PolicyLine
   */
  property get ExistingAdditionalInsureds() : AccountContact[] {
    var plugin = Plugins.get(IContactConfigPlugin)
    var accountContactRoleType = plugin.getAccountContactRoleTypeFor("PolicyAddlInsured")
    return this.Branch.Policy.Account.getAccountContactsWithRole(accountContactRoleType)
  }

  /**
   * Any Active account contact that is not an additional insured and can be an additional insured.
   */
  property get AdditionalInsuredOtherCandidates() : AccountContact[] {
    var plugin = Plugins.get(IContactConfigPlugin)
    var accountContactRoleType = plugin.getAccountContactRoleTypeFor("PolicyAddlInsured")
    return this.Branch.Policy.Account.ActiveAccountContacts
      .where(\ acr -> plugin.canBeRole(acr.ContactType, accountContactRoleType) and not acr.hasRole(accountContactRoleType))
  }

  function addNewAdditionalInsuredDetailForContact(contact : Contact) : PolicyAddlInsuredDetail {
    var policyAdditionalInsured = this.AdditionalInsureds.firstWhere( \ ai -> ai.AccountContactRole.AccountContact.Contact == contact )
    if (policyAdditionalInsured == null) {
      policyAdditionalInsured = this.addNewAdditionalInsured(contact)
    }
    var policyadditionalInsuredDetail = policyAdditionalInsured.addNewAdditionalInsuredDetail()
    return policyadditionalInsuredDetail
  }

  function addNewAdditionalInsuredDetailOfContactType(contactType : ContactType) : PolicyAddlInsuredDetail {
    var acctContact = this.Branch.Policy.Account.addNewAccountContactOfType(contactType)
    acctContact.addNewRole("AdditionalInsured")
    var policyAdditionalInsured = this.addNewAdditionalInsured(acctContact.Contact)
    var policyAdditionalInsuredDetail = policyAdditionalInsured.addNewAdditionalInsuredDetail()
    return policyAdditionalInsuredDetail
  }

  /**
   * Add the supplied <code>acctContact</code> as a PolicyAddlInsured.  This method
   * has the side-effect if adding an AdditionalInsured role to the acctContact if it
   * doesn't already have one; or of adding the AccountContact if one does not exist
   * for the Contact on this Account already.
   */
  function addNewAdditionalInsured(contact : Contact) : PolicyAddlInsured {
    if (this.AdditionalInsureds.firstWhere( \ p -> p.AccountContactRole.AccountContact.Contact == contact ) != null) {
      throw new UserDisplayableException(displaykey.Web.Contact.PolicyAddlInsured.Error.AlreadyExists(contact))
    }
    var identityPropertyMap = new HashMap<IEntityPropertyInfo, Object>()
    identityPropertyMap.put(PolicyAddlInsured.Type.EntityProperties.toList().firstWhere(\ i -> i.Name == "PolicyLine"), this.FixedId)
    var policyAdditionalInsured = this.Branch.addNewPolicyContactRoleForContactWithCheckProperties(contact, "PolicyAddlInsured", identityPropertyMap) as PolicyAddlInsured
    this.addToAdditionalInsureds(policyAdditionalInsured)
    return policyAdditionalInsured
  }

  /**
   * Populates the internal reference date field on all coverables, coverages, modifiables and
   * modifiers with their current reference date, if the field is not already populated. This
   * method should only be called when binding a policy period to improve the performance of
   * calculating reference dates in subsequent jobs within the same policy term.
   */
  function denormalizeReferenceDates() {
    var coverables = this.AllCoverables
    coverables.each( \ c -> c.denormalizeCoverableReferenceDate() )
    coverables*.CoveragesConditionsAndExclusionsFromCoverable.each(\ c -> c.denormalizeReferenceDate())

    var modifiables = this.AllModifiables
    modifiables.each( \ m -> m.denormalizeModifiableReferenceDate() )
    modifiables*.Modifiers.each( \ m -> m.denormalizeReferenceDate() )
  }

  /**
   * Sets the internal reference date field on all coverables, coverages, modifiables and modifiers
   * to null. This method should only be called when creating a new policy term to ensure that all
   * reference dates are recalculated.
   */
  function clearDenormalizedReferenceDates() {
    var coverables = this.AllCoverables
    coverables.each( \ c -> c.clearCoverableReferenceDateInternal() )
    coverables*.CoveragesConditionsAndExclusionsFromCoverable.each(\ c -> c.clearReferenceDateInternal())

    var modifiables = this.AllModifiables
    modifiables.each( \ m -> m.clearModifiableReferenceDateInternal() )
    modifiables*.Modifiers.each( \ m -> m.clearReferenceDateInternal() )
  }

  property get UWCompanyCode() : UWCompanyCode {
    return this.Branch.UWCompany.Code
  }

  property get AvailableCurrencies() : List<Currency> {
    return this.Pattern.AvailableCoverageCurrencies*.Currency as List<Currency>
  }

}
