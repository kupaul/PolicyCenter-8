package gw.pcf.contacts

uses gw.api.util.LocationUtil
uses gw.plugin.contact.DuplicateContactResult
uses java.lang.Throwable
uses gw.pcf.duplicatecontacts.DuplicateContactsPopupHelper
uses gw.pcf.duplicatecontacts.PotentialMatchChecker
uses gw.pcf.duplicatecontacts.DuplicateContactsPopupHelper
uses pcf.api.Location

@Export
class DuplicateContactsPopupUIHelper {

  var _contactHelper : DuplicateContactsPopupHelper as ContactHelper
  var _potentialMatchChecker : PotentialMatchChecker as PotentialMatchChecker
  var _selectionWarningAlreadyIssued : Boolean as SelectionWarningAlreadyIssued

  construct(contactsPopupHelper: DuplicateContactsPopupHelper) {
    _selectionWarningAlreadyIssued = false
    _contactHelper = contactsPopupHelper
    _potentialMatchChecker = new gw.pcf.duplicatecontacts.PotentialMatchChecker(_contactHelper.duplicateResultsContainer)
  }

  /**
   * If the duplicate is an acceptable selection, copy its data into the newAccountContact
   */
  function importContactData(duplicate : DuplicateContactResult, currentLocation : Location) {
    if (isAcceptableSelection(duplicate)) {
      try {
        ContactHelper.copyDataFromDuplicateABContactToPCContact(duplicate)
      } catch (e : Throwable) {
        LocationUtil.addRequestScopedErrorMessage(e.Message)
      }
      currentLocation.commit() // have to do this to roll the change up to the parent page and close this popup
    }
  }

  /**
   * If the user tries to cancel without selecting an existing exact match, display a warning.
   */
  function checkForNoSelection(originalContact : Contact) {
    if (PotentialMatchChecker.hasExactMatch() and originalContact.AddressBookUID == null) {
      LocationUtil.addRequestScopedWarningMessage(displaykey.Web.DuplicateContactsPopup.Warning.NoSelection)
    }
  }

  /**
   * If the exactMatchABUIDs list is empty then there were no exact matches and so there is no validation required.
   * Otherwise, check if the user selected an exact match and issue a warning if not.  Note that this function displays
   * a warning no more than one time.  If the user gets the warning and then makes a new selection (which could be
   * different from the first one), that selection will be considered valid on the second invocation.
   */
  private function isAcceptableSelection(duplicate : DuplicateContactResult) : boolean {
    var isAcceptableSelection = true
    if (not SelectionWarningAlreadyIssued) {
      if (not PotentialMatchChecker.canAcceptSelection(duplicate)) {
        LocationUtil.addRequestScopedWarningMessage(displaykey.Web.DuplicateContactsPopup.Warning.ExactNotSelected)
        SelectionWarningAlreadyIssued = true
        isAcceptableSelection = false
      }
    }
    return isAcceptableSelection
  }
}