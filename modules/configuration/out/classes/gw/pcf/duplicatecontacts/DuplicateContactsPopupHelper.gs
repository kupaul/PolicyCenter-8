package gw.pcf.duplicatecontacts

uses gw.api.util.DisplayableException
uses gw.plugin.contact.ContactSystemPlugin
uses gw.plugin.contact.DuplicateContactResultContainer
uses pcf.DuplicateContactsPopup
uses gw.plugin.contact.ContactSystemPlugin
uses gw.plugin.Plugins
uses gw.plugin.contact.DuplicateContactResult
uses gw.api.database.Query

/**
 * Provides very specific support for validating requirements before loading the DuplicateContactsPopup page.
 */
@Export
class DuplicateContactsPopupHelper {

  var _originalContact : Contact as readonly originalContact
  var _plugin = Plugins.get(ContactSystemPlugin)
  var _duplicateResultsContainer : DuplicateContactResultContainer as readonly duplicateResultsContainer
  var _existingPCContactWithABContactMatch : Contact as existingPCContactWithABContactMatch
  var _existingContactsInParentPageLV : Contact[]
  var _dupesCheckedOnUpdate = false
  var _sameContactAlreadyExistsInParentPageLV = false
  
  construct(contact : Contact, existingContactsInParentPageLV : Contact[]) {
    _originalContact = contact
    _existingContactsInParentPageLV = existingContactsInParentPageLV
  }
  
  construct(contact : Contact) {   
    this(contact, {})
  }
  
  /**
   * Invoke this method to perform validation before pushing the data out to the DuplicateContactsPopup page.
   */
  function push() {
    _dupesCheckedOnUpdate = true
    validate()
    pushToPCF()
  }
  
  function checkForDuplicatesOrUpdate(commit()) {
    if (not _dupesCheckedOnUpdate and hasDuplicateResults()) {
      push()
    } else {
      if (_sameContactAlreadyExistsInParentPageLV) {
        _dupesCheckedOnUpdate = false
        _sameContactAlreadyExistsInParentPageLV = false
        throw new DisplayableException(displaykey.Web.Contact.DuplicatePolicyContactRoleError(_originalContact))
      }
      commit()
    }
  }
  
  private function hasDuplicateResults() : boolean {
    try {
      _duplicateResultsContainer = _originalContact.PotentialDuplicates
    } catch (rfe : wsi.remote.gw.webservice.ab.ab700.abcontactapi.faults.RequiredFieldException) {
      // in this case, we are trying to commit the contact, but don't have enough info to check dupes - allow the user to commit anyway
      return false
    } catch (rfe : wsi.remote.gw.webservice.ab.ab801.abcontactapi.faults.RequiredFieldException) {
      // in this case, we are trying to commit the contact, but don't have enough info to check dupes - allow the user to commit anyway
      return false
    } catch (rfe : gw.api.webservice.exception.RequiredFieldException) {
      // in this case, we are trying to commit the contact, but don't have enough info to check dupes - allow the user to commit anyway
      return false
    }
    return _duplicateResultsContainer.Results.HasElements
  }
  
  /**
   * Return whether or not to show the "Check for Duplicates" button.  Return true if:
   * 1. We are adding a new contact, NOT editing an existing one
   * 2. We are connected to a valid contact managment plugin
   * 3. The contact we are looking at is not linked
   */
  property get ShowButton() : boolean {
    return _plugin.supportsFindingDuplicates() and _originalContact.AddressBookUID == null
  }
  
  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  /**
   * Checks that potential duplicates can be invoked successfully.  If the contact management system identifies
   * missing required fields, an exception will be thrown.  If the call to getPotentialDuplicates() returns no
   * results, and exception will be thrown.  In all other cases, the method will simply return, which indicates
   * that the push to the PCF page can proceed.
   */
  private function validate() {
    try {
       _duplicateResultsContainer = _originalContact.PotentialDuplicates
    } catch (rfe : wsi.remote.gw.webservice.ab.ab700.abcontactapi.faults.RequiredFieldException) {
      throw new DisplayableException(displaykey.Web.Contact.CheckForDuplicates.Error.MissingRequiredFields(rfe.Message))
    } catch (rfe : wsi.remote.gw.webservice.ab.ab801.abcontactapi.faults.RequiredFieldException) {
      throw new DisplayableException(displaykey.Web.Contact.CheckForDuplicates.Error.MissingRequiredFields(rfe.Message))
    } catch (rfe : gw.api.webservice.exception.RequiredFieldException) {
      throw new DisplayableException(displaykey.Web.Contact.CheckForDuplicates.Error.MissingRequiredFields(rfe.Message))
    }
    if (_duplicateResultsContainer.Results.Empty) {
      throw new DisplayableException(displaykey.Web.Contact.CheckForDuplicates.Error.NoResults)
    }
  }
  
  /**
   * Load the DuplicateContactsPopup page with the current duplicate results container and the current contact.
   */
  private function pushToPCF() {
    DuplicateContactsPopup.push(this)
  }
  
  /**
   * If any of the existing contacts in the LV of the caller popup has same abuid as abDuplicate, set a flag.
   * Else, check the database for any contacts with the same abuid, copy the fields from abDuplicate to such
   * contact if it exists(or copy to the original new contact if no such contact in the db)
   */
  function copyDataFromDuplicateABContactToPCContact(abDuplicate : DuplicateContactResult ) {
    //check existing contacts in the LV of the caller popup
    if (_existingContactsInParentPageLV.hasMatch(\ c -> {return c.AddressBookUID == abDuplicate.ContactAddressBookUID})) {
      if (originalContact.AddressBookUID == null) {
        _sameContactAlreadyExistsInParentPageLV = true        
      }
    } else { //check database
      var existingContactWithABUID = Query.make(Contact)
        .compare("AddressBookUID", Equals, abDuplicate.ContactAddressBookUID)
        .select().AtMostOneRow
      _existingPCContactWithABContactMatch = existingContactWithABUID
      abDuplicate.overwriteContactFields(originalContact)
    }
  }

}
