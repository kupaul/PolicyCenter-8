package gw.web.account

uses java.util.ArrayList
uses gw.api.util.DisplayableException
uses javax.swing.text.html.parser.Entity
uses pcf.EditPolicyAddressPopup
uses pcf.LinkedAddressEditPopup
uses entity.PolicyPeriod
uses entity.PolicyPriNamedInsured
uses java.lang.String
uses entity.Contact
uses entity.AccountContactView

@Export
class AccountInfoInputSetUIHelper {

  public static function canChangePrimaryNamedInsured(period : entity.PolicyPeriod, primaryNamedInsured : entity.PolicyPriNamedInsured) : boolean {
    var errorMsgs = new ArrayList<String>()
    period.Lines.each(\ line -> {
      var errorMsg = line.canSafelyDeleteNamedInsured(primaryNamedInsured)
      if (errorMsg != null){
        errorMsgs.add(errorMsg)
      }
    })
    if (not (errorMsgs.Empty)){
      throw new DisplayableException(errorMsgs.toTypedArray())
    }

    return true
  }

  public static function canChangeAdditionalNamedInsured(period : entity.PolicyPeriod, contact : Contact) : boolean {
    var errorMsgs = new ArrayList<String>()
    period.Lines.each(\ line -> {
      var errorMsg = line.canSafelyDeleteExistingContact(contact)
      if (errorMsg != null){
        errorMsgs.add(errorMsg)
      }
    })
    if (not (errorMsgs.Empty)){
      throw new DisplayableException(errorMsgs.toTypedArray())
    }
    return true
  }

  public static function changePrimaryNamedInsured(period : entity.PolicyPeriod, primaryNamedInsured: entity.PolicyPriNamedInsured, contact : Contact) {
    if (canChangePrimaryNamedInsured(period, primaryNamedInsured)){
      period.changePrimaryNamedInsuredTo(contact)
    }
  }

  public static function changeToExistingContact(period : entity.PolicyPeriod, primaryNamedInsured : entity.PolicyPriNamedInsured, contact : Contact){
    if (canChangePrimaryNamedInsured(period, primaryNamedInsured) && canChangeAdditionalNamedInsured(period, contact)){
      period.changePrimaryNamedInsuredTo(contact)
    }
  }

  public static function getOtherContacts(period : entity.PolicyPeriod) : AccountContactView[] {
    return period.PolicyNamedInsuredCandidates
        .subtract({period.PrimaryNamedInsured.AccountContactRole.AccountContact})
        .toTypedArray().asViews()
  }

  public static function openEditAddressPopup(period : entity.PolicyPeriod) {
    if (period.PolicyAddress.SyncedToAccount and period.PolicyAddress.Address.LinkedAddress != null) {
      LinkedAddressEditPopup.push(period.PolicyAddress.Address)
    } else {
      EditPolicyAddressPopup.push(period, false)  // if unsynced, or synced and not linked
    }
  }

  public static function getInitialValueForOfficalIDsUpdated(period : entity.PolicyPeriod, inEditMode : boolean) : boolean {
    if ( inEditMode ) {
      period.PrimaryNamedInsured.updateOfficialIDs()
      return true
    } else {
      return false
    }
  }
}