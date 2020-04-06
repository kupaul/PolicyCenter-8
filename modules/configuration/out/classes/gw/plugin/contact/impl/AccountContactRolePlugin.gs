package gw.plugin.contact.impl

uses gw.plugin.contact.IAccountContactRolePlugin
uses gw.api.database.Query


@Export
class AccountContactRolePlugin implements IAccountContactRolePlugin {

  construct() {
  }

  override function cloneExtensions(oldAccountContactRole : AccountContactRole, newAccountContactRole : AccountContactRole) {
  }
  
  override function copyPendingUpdatesForAccountContactRole(oldAccountContactRole: AccountContactRole, newAccountContactRole: AccountContactRole) {
    var isSameRoleType = typeof oldAccountContactRole == typeof newAccountContactRole
    var isSameContact = oldAccountContactRole.AccountContact.Contact == newAccountContactRole.AccountContact.Contact
    if (oldAccountContactRole != newAccountContactRole and isSameRoleType and isSameContact){
      var updates = findUpdatesForRole(oldAccountContactRole)
      var bundle = newAccountContactRole.Bundle
      for (update in updates){
        update = bundle.add(update)
        var anUpdate = update.copy() as PendingAccountContactRoleUpdate
        anUpdate.TargetAccountContactRole = newAccountContactRole
      }     
    }
  }
  
  private function findUpdatesForRole(targetRole : AccountContactRole) : List<PendingAccountContactRoleUpdate> {
     return Query.make(PendingAccountContactRoleUpdate)
       .compare("TargetAccountContactRole", Equals, targetRole)
       .select().toList()
  }


}
